import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import communitiesData from '@/public/data/communities.json';
import lastUpdateData from '@/public/data/last_update.json';

export type SourceKind = 'ics' | 'gcal' | 'website' | 'api';

export interface EventSource {
  id: string;
  name: string;
  kind: SourceKind;
  kindLabel: string;
  website?: string;
  feedUrl?: string;
  communityId?: string;
  communityName?: string;
  filterNyc?: boolean;
  ingest: string;
  cadence: string;
}

export interface OutboundFeed {
  name: string;
  href: string;
  kind: string;
  note: string;
}

export interface EventSourceCatalog {
  sources: EventSource[];
  lastUpdateISO?: string;
  cadence: string;
  inboundNote: string;
  configPath: string;
  configUrl: string;
  outboundFeeds: OutboundFeed[];
}

const CADENCE =
  'Pulled daily at 08:00 UTC by GitHub Actions, then merged into the site event list.';

const CONFIG_RELATIVE_PATH = 'scraper/scrapers/calendar_configs.py';
const CONFIG_URL =
  'https://github.com/conniexu444/nyctechevents/blob/main/scraper/scrapers/calendar_configs.py';

type CommunityRecord = {
  id: string;
  name: string;
  website?: string;
};

const COMMUNITIES = (communitiesData.communities || []) as CommunityRecord[];

const DEDICATED_SCRAPERS: Record<
  string,
  Omit<EventSource, 'cadence' | 'communityName'>
> = {
  pioneer_works_scraper: {
    id: 'pioneer_works',
    name: 'Pioneer Works',
    kind: 'website',
    kindLabel: 'Website calendar',
    website: 'https://pioneerworks.org',
    feedUrl: 'https://pioneerworks.org/calendar',
    communityId: 'com_pioneer_works',
    ingest:
      'HTML scrape of the public Pioneer Works calendar page (Next.js page data).',
  },
  fabrik_scraper: {
    id: 'fabrik',
    name: 'Fabrik',
    kind: 'api',
    kindLabel: 'JSON API',
    website: 'https://www.joinfabrik.com',
    feedUrl: 'https://api.joinfabrik.com/guests/all-gatherings',
    communityId: 'com_fabrik_ny',
    ingest:
      'Public gatherings API. Only Tribeca and Dumbo (NYC) spaces are kept.',
  },
  boshis_scraper: {
    id: 'boshis',
    name: "Boshi's Place",
    kind: 'website',
    kindLabel: 'Website listing',
    website: 'https://boshis.place',
    feedUrl: 'https://boshis.place/events/',
    communityId: 'com_boshis',
    ingest: 'HTML scrape of the events listing and individual event pages.',
  },
  ny_bio_connect_scraper: {
    id: 'ny_bio_connect',
    name: 'New York Bio Connect',
    kind: 'website',
    kindLabel: 'Website listing',
    website: 'https://newyorkbioconnect.com',
    feedUrl: 'https://newyorkbioconnect.com/events/?region=nyc',
    communityId: 'com_ny_bio_connect',
    ingest: 'HTML scrape of the NYC-region event listings.',
  },
  garys_guide_scraper: {
    id: 'garys_guide',
    name: "Gary's Guide",
    kind: 'website',
    kindLabel: 'Event aggregator',
    website: 'https://www.garysguide.com',
    feedUrl: 'https://www.garysguide.com/events?region=nyc',
    communityId: 'com_gary',
    ingest: 'HTML scrape of the NYC events directory.',
  },
  betaworks_scraper: {
    id: 'betaworks',
    name: 'Betaworks',
    kind: 'website',
    kindLabel: 'Website listing',
    website: 'https://www.betaworks.com',
    feedUrl: 'https://www.betaworks.com/events',
    communityId: 'com_betaworks',
    ingest: 'HTML scrape of the Betaworks events page.',
  },
};

const EXPANDING_SCRAPERS = new Set([
  'google_calendar_scraper',
  'ics_calendar_scraper',
]);

function stripFullLineComments(source: string): string {
  return source
    .split('\n')
    .map((line) => (line.trimStart().startsWith('#') ? '' : line))
    .join('\n');
}

function extractAssignmentBlock(source: string, name: string): string {
  const needle = `${name} = `;
  const start = source.indexOf(needle);
  if (start === -1) {
    throw new Error(`Could not find ${name} in ${CONFIG_RELATIVE_PATH}`);
  }

  let i = start + needle.length;
  while (i < source.length && source[i] !== '[' && source[i] !== '{') {
    i += 1;
  }
  if (i >= source.length) {
    throw new Error(`Could not find opening bracket for ${name}`);
  }

  const open = source[i];
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  for (let j = i; j < source.length; j += 1) {
    if (source[j] === open) depth += 1;
    else if (source[j] === close) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(i, j + 1);
      }
    }
  }
  throw new Error(`Unclosed assignment for ${name}`);
}

function parsePythonScalar(raw: string): string | boolean {
  const value = raw.trim();
  if (value === 'True') return true;
  if (value === 'False') return false;
  const quoted = value.match(/^['"]([\s\S]*)['"]$/);
  return quoted ? quoted[1] : value;
}

function parsePythonDict(body: string): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  const pairRe = /['"]([^'"]+)['"]\s*:\s*(True|False|['"][^'"]*['"])/g;
  let match: RegExpExecArray | null;
  while ((match = pairRe.exec(body))) {
    result[match[1]] = parsePythonScalar(match[2]);
  }
  return result;
}

function parsePythonDictList(block: string): Record<string, string | boolean>[] {
  const dicts: Record<string, string | boolean>[] = [];
  const dictRe = /\{([^{}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = dictRe.exec(block))) {
    dicts.push(parsePythonDict(match[1]));
  }
  return dicts;
}

function parseNamedDictOfDicts(
  block: string
): { key: string; value: Record<string, string | boolean> }[] {
  const entries: { key: string; value: Record<string, string | boolean> }[] = [];
  const entryRe = /['"]([^'"]+)['"]\s*:\s*\{([^{}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = entryRe.exec(block))) {
    entries.push({ key: match[1], value: parsePythonDict(match[2]) });
  }
  return entries;
}

function parsePythonStringList(block: string): string[] {
  return [...block.matchAll(/['"]([a-z0-9_]+)['"]/g)].map((match) => match[1]);
}

function parseAliasMap(block: string): Record<string, string> {
  const aliases: Record<string, string> = {};
  const pairRe = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = pairRe.exec(block))) {
    aliases[match[1]] = match[2];
  }
  return aliases;
}

function humanizeKey(key: string): string {
  const specials: Record<string, string> = {
    nyc: 'NYC',
    ny: 'NY',
    ics: 'ICS',
    api: 'API',
  };
  return key
    .split('_')
    .map((part) => specials[part] || part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveCommunity(communityId?: string, aliases: Record<string, string> = {}) {
  if (!communityId) return undefined;
  const resolved = aliases[communityId] || communityId;
  return COMMUNITIES.find((community) => community.id === resolved);
}

function lumaCalendarUrl(icsUrl: string): string | undefined {
  const match = icsUrl.match(/id=(cal-[A-Za-z0-9]+)/);
  return match ? `https://luma.com/calendar/${match[1]}` : undefined;
}

function googleCalendarUrl(calendarId: string): string {
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`;
}

function enrichSource(
  source: Omit<EventSource, 'cadence' | 'communityName'> & { communityName?: string },
  aliases: Record<string, string>
): EventSource {
  const community = resolveCommunity(source.communityId, aliases);
  return {
    ...source,
    cadence: CADENCE,
    communityId: community?.id || source.communityId,
    communityName: community?.name || source.communityName,
    website: source.website || community?.website,
  };
}

function loadCalendarConfigSource(): string {
  return readFileSync(join(process.cwd(), CONFIG_RELATIVE_PATH), 'utf8');
}

export function getEventSourceCatalog(): EventSourceCatalog {
  const raw = stripFullLineComments(loadCalendarConfigSource());
  const aliases = parseAliasMap(extractAssignmentBlock(raw, 'COMMUNITY_ID_ALIASES'));
  const icsCalendars = parsePythonDictList(extractAssignmentBlock(raw, 'ICS_CALENDARS'));
  const googleCalendars = parseNamedDictOfDicts(extractAssignmentBlock(raw, 'GOOGLE_CALENDARS'));
  const scrapers = parsePythonStringList(extractAssignmentBlock(raw, 'SCRAPERS'));

  const sources: EventSource[] = [];

  if (scrapers.includes('ics_calendar_scraper')) {
    for (const calendar of icsCalendars) {
      const name = String(calendar.display_name || calendar.name || 'Luma calendar');
      const feedUrl = typeof calendar.url === 'string' ? calendar.url : undefined;
      const website =
        (typeof calendar.website === 'string' && calendar.website) ||
        (feedUrl ? lumaCalendarUrl(feedUrl) : undefined);
      sources.push(
        enrichSource(
          {
            id: `ics_${calendar.name || name}`,
            name,
            kind: 'ics',
            kindLabel: 'Luma ICS calendar',
            website,
            feedUrl,
            communityId: typeof calendar.community_id === 'string' ? calendar.community_id : undefined,
            filterNyc: calendar.filter_nyc === true,
            ingest:
              calendar.filter_nyc === true
                ? 'iCalendar (ICS) feed from Luma. Listings outside NYC are dropped.'
                : 'iCalendar (ICS) feed from Luma.',
          },
          aliases
        )
      );
    }
  }

  if (scrapers.includes('google_calendar_scraper')) {
    for (const { key, value } of googleCalendars) {
      const calendarId = typeof value.id === 'string' ? value.id : '';
      const imported = calendarId.includes('@import.calendar.google.com');
      sources.push(
        enrichSource(
          {
            id: `gcal_${key}`,
            name: humanizeKey(key),
            kind: 'gcal',
            kindLabel: imported ? 'Imported Google Calendar' : 'Google Calendar API',
            feedUrl: calendarId ? googleCalendarUrl(calendarId) : undefined,
            communityId: typeof value.community_id === 'string' ? value.community_id : undefined,
            ingest: imported
              ? 'Imported Google Calendar (often from Luma), read with the Google Calendar API.'
              : 'Public Google Calendar, read with the Google Calendar API.',
          },
          aliases
        )
      );
    }
  }

  for (const scraperName of scrapers) {
    if (EXPANDING_SCRAPERS.has(scraperName)) continue;
    const dedicated = DEDICATED_SCRAPERS[scraperName];
    if (!dedicated) {
      sources.push(
        enrichSource(
          {
            id: scraperName,
            name: humanizeKey(scraperName.replace(/_scraper$/, '')),
            kind: 'website',
            kindLabel: 'Custom scraper',
            ingest: `Active scraper module: ${scraperName}.`,
          },
          aliases
        )
      );
      continue;
    }
    sources.push(enrichSource(dedicated, aliases));
  }

  sources.sort((a, b) => a.name.localeCompare(b.name));

  return {
    sources,
    lastUpdateISO: lastUpdateData.lastUpdateISO,
    cadence: CADENCE,
    inboundNote:
      'Every source below is taken from the live scraper list in calendar_configs.py. Commented-out calendars and unused scrapers are not shown.',
    configPath: CONFIG_RELATIVE_PATH,
    configUrl: CONFIG_URL,
    outboundFeeds: [
      {
        name: 'Site RSS',
        href: '/rss',
        kind: 'RSS 2.0',
        note: 'All upcoming events. Cached for about an hour. Filter with ?type=Hackerspace on /api/rss.',
      },
      {
        name: 'Site calendar',
        href: '/ics',
        kind: 'ICS',
        note: 'Subscribe in a calendar app. Filter with ?type= on /api/ics.',
      },
      {
        name: 'Single-event calendar',
        href: '/api/events/{id}/ics',
        kind: 'ICS',
        note: 'Available from each event page for adding one listing to your calendar.',
      },
    ],
  };
}
