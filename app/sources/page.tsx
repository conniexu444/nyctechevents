import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { getEventSourceCatalog } from '@/lib/eventSources';
import SourcesClient from './SourcesClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Event Data Sources | NYC Tech Events',
  description:
    'See every calendar, ICS feed, API, and website this site uses to collect NYC tech events — plus how often the list is refreshed.',
  keywords:
    'NYC tech events sources, Luma calendars, Google Calendar ICS, event scrapers, data sources',
  openGraph: {
    title: 'Event Data Sources | NYC Tech Events',
    description:
      'A public list of every scraper, calendar, and feed behind NYC tech events.',
    url: `${SITE_URL}/sources`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/nyc_skyline.gif`,
        width: 1200,
        height: 630,
        alt: 'NYC Tech Events data sources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nycdosomething',
    creator: '@nycdosomething',
    title: 'Event Data Sources | NYC Tech Events',
    description:
      'A public list of every scraper, calendar, and feed behind NYC tech events.',
    images: [`${SITE_URL}/nyc_skyline.gif`],
  },
  alternates: {
    canonical: `${SITE_URL}/sources`,
  },
};

export default function SourcesPage() {
  const catalog = getEventSourceCatalog();
  return <SourcesClient catalog={catalog} />;
}
