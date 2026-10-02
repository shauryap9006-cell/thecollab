/**
 * thecollab — single source of truth for business info.
 *
 * Every contact-facing string on the site reads from this file.
 * Update the PLACEHOLDER values below once and the whole site follows.
 */

export const SITE = {
  /** Brand */
  name: 'thecollab',
  tagline: 'Your Website. Your Brand. Your Reach.',
  shortDescription:
    'A digital growth agency building stronger online presences through websites, social media, and creator-led marketing.',

  /** WhatsApp number in international format, digits only. */
  whatsappNumber: '917310062393',
  /** Primary contact email address. */
  email: 'thecollab870@gmail.com',
  /** Official Instagram handle (no @). */
  instagramHandle: 'the.collab_08',
  /** ⚠️ PLACEHOLDER — replace with the real portfolio URL once known. */
  portfolioUrl: 'https://shauryap9006-cell.github.io/portfolio',

  /** Prefilled WhatsApp intro message a client sends when they tap "Start a project". */
  whatsappIntroMessage: "Hi thecollab! I found your website and I'd like to discuss a project.",
} as const;

export type SiteConfig = typeof SITE;

/** WhatsApp deep link with an optional prefilled message. */
export const whatsappLink = (message: string = SITE.whatsappIntroMessage) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;

/** WhatsApp deep link prefilled for a specific service enquiry. */
export const whatsappServiceLink = (serviceName: string) =>
  whatsappLink(`Hi thecollab! I'm interested in your ${serviceName} service. Let's talk.`);

/** mailto: link with a subject prefilled. */
export const emailLink = (subject: string = `Project enquiry — ${SITE.name}`) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

/** Instagram DM / profile deep link. */
export const instagramLink = () => `https://www.instagram.com/${SITE.instagramHandle}/`;

/** Build a base-path-aware public URL (GitHub Pages needs the /thecollab prefix). */
export const withBasePath = (path: string) => {
  const base = process.env.NODE_ENV === 'production' ? '/thecollab' : '';
  const cleanPath = path.startsWith('/') ? path : `/${path.replace(/^\.\//, '')}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};
