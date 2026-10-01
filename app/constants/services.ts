import { Service } from "../types";

/**
 * thecollab's seven core services, shown in the OFFERINGS carousel.
 * Each carries its own 3D icon (see experience/projects/ServiceAsset.tsx)
 * and an ENQUIRE deep link built via whatsappServiceLink(name).
 */
export const SERVICES: Service[] = [
  {
    title: 'WEBSITE',
    date: 'DESIGN + BUILD',
    subtext: 'Modern, fast, responsive websites designed around the business, its audience and its goals — from landing pages to e-commerce.',
    icon: 'globe',
    enquire: true,
  },
  {
    title: 'SOCIAL MEDIA',
    date: 'INSTAGRAM + MORE',
    subtext: 'Strategy, content planning, calendars, captions and profile optimization that build a recognizable digital identity.',
    icon: 'phone',
    enquire: true,
  },
  {
    title: 'REELS',
    date: 'SHORT-FORM CONTENT',
    subtext: 'Creative concepts and short-form content strategy designed for discovery — not just posting.',
    icon: 'reel',
    enquire: true,
  },
  {
    title: 'CREATOR COLLABS',
    date: 'BRAND → CREATOR',
    subtext: 'We connect businesses with relevant creators and coordinate the entire collaboration process.',
    icon: 'handshake',
    enquire: true,
  },
  {
    title: 'LOCAL MARKETING',
    date: 'HYPERLOCAL REACH',
    subtext: 'For cafés, salons, gyms and stores — creators whose audience is actually located nearby.',
    icon: 'pin',
    enquire: true,
  },
  {
    title: 'CAMPAIGN MANAGEMENT',
    date: 'END-TO-END',
    subtext: 'From understanding the brand to tracking results — the full creator-campaign workflow, handled.',
    icon: 'rocket',
    enquire: true,
  },
  {
    title: 'BRAND PRESENCE',
    date: 'IDENTITY + DIRECTION',
    subtext: 'Visual direction, messaging and creative concepts that make the business easier to recognize and remember.',
    icon: 'palette',
    enquire: true,
  },
];
