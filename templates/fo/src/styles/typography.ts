
export interface TypographyToken {
  role: string;
  tailwindClasses: string;
  description: string;
  fontSize: {
    mobile: string;
    tablet: string;
    desktop: string;
    largeDesktop?: string;
  };
}

export const typographyTokens = {
  displayHero: {
    role: 'Display Hero Title',
    tailwindClasses: 'font-display text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]',
    description: 'Primary landing hero title (H1)',
    fontSize: {
      mobile: '1.875rem (30px)',
      tablet: '3rem (48px)',
      desktop: '3.75rem (60px)',
      largeDesktop: '4.5rem (72px)',
    },
  },
  sectionHeading: {
    role: 'Section Heading',
    tailwindClasses: 'font-display text-2xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight',
    description: 'Main section titles (H2) across hero, features, and content sections',
    fontSize: {
      mobile: '1.5rem (24px)',
      tablet: '2.25rem (36px)',
      desktop: '3rem (48px)',
    },
  },
  cardTitle: {
    role: 'Card Title / Modal Heading',
    tailwindClasses: 'font-display text-lg md:text-xl font-bold tracking-tight text-foreground leading-snug',
    description: 'Card titles, dialog headers, and drawer headings (H3)',
    fontSize: {
      mobile: '1.125rem (18px)',
      tablet: '1.25rem (20px)',
      desktop: '1.25rem (20px)',
    },
  },
  accentEyebrow: {
    role: 'Accent Eyebrow Tag',
    tailwindClasses: 'inline-flex items-center gap-1.5 text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent',
    description: 'Section category tags, badges, and step indicators',
    fontSize: {
      mobile: '10px',
      tablet: '12px',
      desktop: '12px',
    },
  },
  bodyCopy: {
    role: 'Standard Body Copy',
    tailwindClasses: 'text-xs md:text-sm text-muted-foreground leading-relaxed',
    description: 'Standard descriptive copy, card descriptions, form helpers',
    fontSize: {
      mobile: '0.75rem (12px)',
      tablet: '0.875rem (14px)',
      desktop: '0.875rem (14px)',
    },
  },
  bodyLarge: {
    role: 'Subhead / Lead Paragraph',
    tailwindClasses: 'text-sm md:text-base text-muted-foreground leading-relaxed',
    description: 'Lead paragraphs under display hero titles and rich content articles',
    fontSize: {
      mobile: '0.875rem (14px)',
      tablet: '1rem (16px)',
      desktop: '1rem (16px)',
    },
  },
} as const;
