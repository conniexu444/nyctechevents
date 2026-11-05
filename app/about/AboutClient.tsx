'use client';
import React from 'react';
import { Panel } from '@/app/components/ui/Panel';

const CONNIE_AVATAR = 'https://avatars.githubusercontent.com/u/43225884?v=4';

export default function AboutClient() {
  return (
    <div className="about-layout">
      <Panel title="ABOUT US" systemId="ABOUT-001">
        <div className="about-intro">
          <h1>The Creators</h1>
          <p>
            NYC Tech Events is built and co-owned by Joshua Spergel and Connie Xu —
            two New Yorkers gathering what&apos;s happening across the city&apos;s tech scene.
          </p>
        </div>

        <div className="creators-grid">
          <article className="creator-card">
            <img
              src="/profile.png"
              alt="Joshua Spergel"
              className="profile-image"
              width={150}
              height={150}
            />
            <p className="creator-role">CO-CREATOR</p>
            <h2>Joshua Spergel</h2>
            <p>
              Hi there! I&apos;m Joshua Spergel, and I live near New York City.
              I have a passion for web scraping, particularly for finding and organizing events.
            </p>

            <h3>My Projects</h3>
            <p>
              I run a couple of websites focused on events in NYC:
            </p>
            <ul>
              <li>
                <a href="https://somethingtodo.nyc" target="_blank" rel="noopener noreferrer">
                  somethingtodo.nyc
                </a> - Your go-to source for events happening in the city.
              </li>
              <li>
                (Soon){' '}
                <a href="https://kids.somethingtodo.nyc" target="_blank" rel="noopener noreferrer">
                  kids.somethingtodo.nyc
                </a> - A new site dedicated to events for kids.
              </li>
            </ul>

            <h3>Get In Touch</h3>
            <ul>
              <li>
                <strong>Email:</strong> <a href="mailto:spergel.joshua@gmail.com">spergel.joshua@gmail.com</a>
              </li>
              <li>
                <strong>Personal Website:</strong>{' '}
                <a href="https://spergel.github.io" target="_blank" rel="noopener noreferrer">
                  spergel.github.io
                </a>
              </li>
            </ul>
          </article>

          <article className="creator-card">
            <img
              src={CONNIE_AVATAR}
              alt="Connie Xu"
              className="profile-image"
              width={150}
              height={150}
              referrerPolicy="no-referrer"
            />
            <p className="creator-role">CO-CREATOR</p>
            <h2>Connie Xu</h2>
            <p>
              Hi, I&apos;m Connie Xu — a New York City-based builder of tech products
              and sites. I co-own and work on this NYC tech events directory.
            </p>

            <h3>Get In Touch</h3>
            <ul>
              <li>
                <strong>Email:</strong> <a href="mailto:hello@conniexu.com">hello@conniexu.com</a>
              </li>
              <li>
                <strong>Personal Website:</strong>{' '}
                <a href="https://conniexu.com" target="_blank" rel="noopener noreferrer">
                  conniexu.com
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{' '}
                <a href="https://github.com/conniexu444" target="_blank" rel="noopener noreferrer">
                  github.com/conniexu444
                </a>
              </li>
            </ul>
          </article>
        </div>
      </Panel>
      <style jsx>{`
        .about-layout {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1100px;
          margin: 2rem auto;
          font-family: var(--font-sans);
        }

        .about-intro {
          padding: 1.25rem 1.5rem 0.25rem;
          color: var(--terminal-color);
          line-height: 1.7;
          text-align: center;
        }

        .about-intro h1 {
          color: var(--nyc-white);
          font-size: 2rem;
          margin-bottom: 0.75rem;
          letter-spacing: 0.04em;
        }

        .about-intro p {
          font-size: 1rem;
          margin-bottom: 1rem;
          max-width: 42rem;
          margin-left: auto;
          margin-right: auto;
        }

        .creators-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          padding: 1rem 0.25rem 0.25rem;
        }

        .creator-card {
          padding: 1.5rem;
          background: rgba(0, 20, 40, 0.5);
          border: 1px solid var(--terminal-color);
          color: var(--terminal-color);
          line-height: 1.7;
          min-width: 0;
        }

        .profile-image {
          display: block;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 0.75rem auto;
          border: 3px solid var(--nyc-orange);
        }

        .creator-role {
          color: var(--nyc-orange);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.16em;
          text-align: center;
          margin-bottom: 0.35rem;
        }

        .creator-card h2 {
          color: var(--nyc-white);
          font-size: 1.75rem;
          text-align: center;
          margin-bottom: 0.75rem;
        }

        .creator-card h3 {
          color: var(--nyc-orange);
          font-size: 1.25rem;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--terminal-color);
          padding-bottom: 0.3rem;
        }

        .creator-card p {
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .creator-card ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1rem;
        }

        .creator-card li {
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .creator-card a {
          color: var(--nyc-orange);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .creator-card a:hover {
          color: var(--nyc-white);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .about-layout {
            padding: 0.5rem;
            margin: 1rem auto;
          }

          .creators-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 0.75rem 0 0;
          }

          .profile-image {
            width: 120px;
            height: 120px;
          }

          .about-intro h1 {
            font-size: 1.8rem;
          }

          .creator-card h2 {
            font-size: 1.6rem;
          }

          .creator-card h3 {
            font-size: 1.15rem;
          }
        }
      `}</style>
    </div>
  );
}
