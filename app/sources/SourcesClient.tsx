'use client';

import React, { useMemo, useState } from 'react';
import { Panel } from '@/app/components/ui/Panel';
import { FilterButton } from '@/app/components/ui/FilterButton';
import type { EventSource, EventSourceCatalog, SourceKind } from '@/lib/eventSources';

type FilterId = 'all' | SourceKind;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'ics', label: 'LUMA ICS' },
  { id: 'gcal', label: 'GOOGLE CAL' },
  { id: 'website', label: 'WEBSITE' },
  { id: 'api', label: 'API' },
];

function formatLastUpdate(iso?: string): string {
  if (!iso) return 'UNKNOWN';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'UNKNOWN';
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes} UTC`;
}

function hostname(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function SourceCard({ source }: { source: EventSource }) {
  return (
    <article className="source-card">
      <div className="source-header">
        <span className={`kind-badge kind-${source.kind}`}>{source.kindLabel}</span>
        {source.filterNyc && <span className="nyc-badge">NYC FILTER</span>}
      </div>
      <h3 className="source-name">{source.name}</h3>
      <p className="source-ingest">{source.ingest}</p>
      <p className="source-cadence">{source.cadence}</p>
      <div className="source-links">
        {source.website && (
          <a href={source.website} target="_blank" rel="noopener noreferrer">
            Upstream · {hostname(source.website)}
          </a>
        )}
        {source.feedUrl && source.feedUrl !== source.website && (
          <a href={source.feedUrl} target="_blank" rel="noopener noreferrer">
            {source.kind === 'ics' ? 'ICS feed' : source.kind === 'gcal' ? 'Calendar' : 'Source'}
          </a>
        )}
        {source.communityId && (
          <a href={`/communities/${source.communityId}`}>
            Community{source.communityName ? ` · ${source.communityName}` : ''}
          </a>
        )}
      </div>
      <style jsx>{`
        .source-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1rem;
          background: rgba(0, 20, 40, 0.5);
          border: 1px solid var(--terminal-color);
          min-height: 100%;
        }

        .source-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .kind-badge,
        .nyc-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 0.2rem 0.45rem;
          border: 1px solid var(--terminal-color);
          color: var(--terminal-color);
          background: rgba(0, 56, 117, 0.35);
        }

        .kind-ics {
          border-color: var(--nyc-orange);
          color: var(--nyc-orange);
        }

        .kind-gcal {
          border-color: #7ec8e3;
          color: #7ec8e3;
        }

        .kind-api {
          border-color: #9dffb0;
          color: #9dffb0;
        }

        .nyc-badge {
          border-color: var(--nyc-white);
          color: var(--nyc-white);
          opacity: 0.85;
        }

        .source-name {
          color: var(--nyc-white);
          font-family: var(--font-display);
          font-size: 1.15rem;
          margin: 0;
          letter-spacing: 0.4px;
        }

        .source-ingest,
        .source-cadence {
          margin: 0;
          color: var(--nyc-white);
          font-size: 0.9rem;
          line-height: 1.5;
          opacity: 0.9;
        }

        .source-cadence {
          color: var(--terminal-color);
          font-family: var(--font-mono);
          font-size: 0.78rem;
        }

        .source-links {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: auto;
        }

        .source-links a {
          color: var(--nyc-orange);
          text-decoration: none;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          word-break: break-word;
        }

        .source-links a:hover {
          color: var(--nyc-white);
          text-decoration: underline;
        }
      `}</style>
    </article>
  );
}

export default function SourcesClient({ catalog }: { catalog: EventSourceCatalog }) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const counts = useMemo(() => {
    return catalog.sources.reduce(
      (acc, source) => {
        acc[source.kind] += 1;
        return acc;
      },
      { ics: 0, gcal: 0, website: 0, api: 0 } as Record<SourceKind, number>
    );
  }, [catalog.sources]);

  const visibleSources = catalog.sources.filter(
    (source) => activeFilter === 'all' || source.kind === activeFilter
  );

  return (
    <div className="sources-layout">
      <Panel
        title="DATA UPLINK"
        systemId="SRC-001"
        footerStats={{
          left: `SOURCES: ${catalog.sources.length}`,
          right: `UPDATED: ${formatLastUpdate(catalog.lastUpdateISO)}`,
        }}
      >
        <div className="sources-intro">
          <p>
            This page lists every live scraper and calendar the site uses to collect NYC
            tech events. The list is derived from{' '}
            <a href={catalog.configUrl} target="_blank" rel="noopener noreferrer">
              {catalog.configPath}
            </a>
            , not a hand-written marketing roster.
          </p>
          <p>{catalog.inboundNote}</p>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-value">{counts.ics}</span>
              <span className="stat-label">Luma ICS</span>
            </div>
            <div className="stat">
              <span className="stat-value">{counts.gcal}</span>
              <span className="stat-label">Google Cal</span>
            </div>
            <div className="stat">
              <span className="stat-value">{counts.website}</span>
              <span className="stat-label">Websites</span>
            </div>
            <div className="stat">
              <span className="stat-value">{counts.api}</span>
              <span className="stat-label">APIs</span>
            </div>
            <div className="stat">
              <span className="stat-value">08:00</span>
              <span className="stat-label">UTC daily</span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="ACTIVE SOURCES" systemId="SRC-002">
        <div className="sources-body">
          <div className="filter-row">
            {FILTERS.map((filter) => (
              <FilterButton
                key={filter.id}
                label={filter.label}
                count={filter.id === 'all' ? catalog.sources.length : counts[filter.id]}
                isActive={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                variant="compact"
              />
            ))}
          </div>

          <div className="sources-grid">
            {visibleSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="SITE FEEDS" systemId="SRC-003">
        <div className="feeds-panel">
          <p>
            Those are inbound sources. The site also publishes its own feeds so you can
            subscribe without scraping us back.
          </p>
          <div className="feeds-grid">
            {catalog.outboundFeeds.map((feed) => (
              <div key={feed.name} className="feed-card">
                <span className="kind-badge">{feed.kind}</span>
                <h3>{feed.name}</h3>
                <p>{feed.note}</p>
                {feed.href.includes('{id}') ? (
                  <span className="feed-path">{feed.href}</span>
                ) : (
                  <a href={feed.href}>{feed.href}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <style jsx>{`
        .sources-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          max-width: 1100px;
          margin: 1.5rem auto 2.5rem;
          padding: 0 1rem;
        }

        .sources-intro,
        .sources-body,
        .feeds-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(0, 20, 40, 0.5);
          border: 1px solid var(--terminal-color);
          color: var(--nyc-white);
          line-height: 1.6;
        }

        .sources-intro p,
        .feeds-panel > p {
          margin: 0;
          font-size: 0.98rem;
        }

        .sources-intro a,
        .feeds-panel a {
          color: var(--nyc-orange);
          text-decoration: none;
        }

        .sources-intro a:hover,
        .feeds-panel a:hover {
          color: var(--nyc-white);
          text-decoration: underline;
        }

        .stat-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.6rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 0.4rem;
          background: rgba(0, 56, 117, 0.3);
          border: 1px solid var(--nyc-orange);
          text-align: center;
        }

        .stat-value {
          color: var(--nyc-orange);
          font-family: var(--font-mono);
          font-size: 1.2rem;
          font-weight: bold;
        }

        .stat-label {
          color: var(--terminal-color);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .filter-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .sources-grid,
        .feeds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.85rem;
        }

        .feed-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(0, 56, 117, 0.25);
          border: 1px solid var(--terminal-color);
        }

        .feed-card h3 {
          margin: 0;
          color: var(--nyc-white);
          font-family: var(--font-display);
          font-size: 1.05rem;
        }

        .feed-card p {
          margin: 0;
          font-size: 0.9rem;
        }

        .feed-path {
          color: var(--terminal-color);
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }

        .kind-badge {
          align-self: flex-start;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 0.2rem 0.45rem;
          border: 1px solid var(--terminal-color);
          color: var(--terminal-color);
        }

        @media (max-width: 800px) {
          .stat-row,
          .filter-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .sources-layout {
            padding: 0 0.6rem;
            margin: 1rem auto 2rem;
          }

          .filter-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
