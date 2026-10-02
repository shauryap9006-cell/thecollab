import { FooterLink } from '../types';
import { SITE, emailLink, instagramLink, whatsappLink } from './site';

export const FOOTER_LINKS: FooterLink[] = [
  {
    name: 'WhatsApp',
    hoverText: 'Chat with us',
    icon: 'icons/whatsapp.svg',
    url: whatsappLink(),
  },
  {
    name: 'Instagram',
    hoverText: `DM @${SITE.instagramHandle}`,
    icon: 'icons/instagram.svg',
    url: instagramLink(),
  },
  {
    name: 'Email',
    hoverText: SITE.email,
    icon: 'icons/mail.svg',
    url: emailLink(),
  },
];
