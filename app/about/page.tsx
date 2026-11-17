import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: "About the Creators | NYC Tech Events",
  description: "Meet Joshua Spergel and Connie Xu, the co-creators of NYC Tech Events. Learn about the team behind this cyberpunk guide to New York's tech scene.",
  openGraph: {
    title: "About the Creators | NYC Tech Events",
    description: "Meet Joshua Spergel and Connie Xu, the co-creators of NYC Tech Events.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/nyc_skyline.gif`,
        width: 1200,
        height: 630,
        alt: "NYC Tech Events — created by Joshua Spergel and Connie Xu"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@nycdosomething",
    creator: "@nycdosomething",
    title: "About the Creators | NYC Tech Events",
    description: "Joshua Spergel and Connie Xu — the team behind NYC Tech Events.",
    images: [`${SITE_URL}/nyc_skyline.gif`]
  }
};

export default function AboutPage() {
  return <AboutClient />;
}
