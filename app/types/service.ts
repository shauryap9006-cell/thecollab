export type ServiceIcon =
  | 'globe'
  | 'phone'
  | 'reel'
  | 'handshake'
  | 'pin'
  | 'rocket'
  | 'palette';

export interface Service {
  title: string;
  date: string;
  subtext: string;
  icon: ServiceIcon;
  enquire?: boolean;
}
