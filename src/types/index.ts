export interface Theme {
  body: string;
  text: string;
  expTxtColor: string;
  highlight: string;
  dark: string;
  secondaryText: string;
  imageHighlight: string;
  compImgHighlight: string;
  jacketColor: string;
  headerColor: string;
  splashBg: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface Blog {
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

export interface HeroChip {
  icon: string;
  label: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface SocialLink {
  name: string;
  link: string;
  fontAwesomeIcon: string;
  backgroundColor: string;
}

export interface TravelDestinations {
  nepal: string[];
  usa: string[];
  moto: string[];
}

export interface NepalTrek {
  name: string;
  emoji: string;
  description: string;
  elevation: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Strenuous";
}

export interface UsaDestination {
  name: string;
  emoji: string;
  description: string;
}

export interface TravelData {
  tagline: string;
  destinations: TravelDestinations;
  nepalCard: { icon: string; title: string; subtitle: string; link: string };
  usaCard: { icon: string; title: string; subtitle: string; link: string };
  motoStrip: { icon: string; label: string; link: string };
  nepalTreks: NepalTrek[];
  usaDestinations: UsaDestination[];
}
