
export const spacingTokens = {
  container: {
    premium: '1440px',
    narrow: '1024px',
    reading: '768px',
  },
  containerPadding: {
    mobile: '1rem (16px)',
    largeMobile: '1.25rem (20px)',
    tablet: '2rem (32px)',
    desktop: '2.5rem (40px)',
    largeDesktop: '3rem (48px)',
    cssClasses: 'px-4 sm:px-5 md:px-8 lg:px-10 xl:px-12',
  },
  sectionSpacing: {
    default: {
      mobile: '2.25rem (36px)',
      largeMobile: '2.75rem (44px)',
      tablet: '3.75rem (60px)',
      desktop: '4.75rem (76px)',
      largeDesktop: '5.75rem (92px)',
      cssClass: 'section-spacing',
    },
    compact: {
      mobile: '1.5rem (24px)',
      largeMobile: '1.75rem (28px)',
      tablet: '2.25rem (36px)',
      desktop: '3rem (48px)',
      largeDesktop: '3.75rem (60px)',
      cssClass: 'section-spacing-sm',
    },
    tight: {
      mobile: '1rem (16px)',
      largeMobile: '1.25rem (20px)',
      tablet: '1.75rem (28px)',
      desktop: '2.25rem (36px)',
      largeDesktop: '2.75rem (44px)',
      cssClass: 'section-spacing-xs',
    },
  },
  cardPadding: {
    compact: 'p-3 sm:p-4',
    standard: 'p-4 sm:p-5 md:p-6',
    generous: 'p-5 sm:p-7 md:p-8 lg:p-10',
  },
  gridGap: {
    tight: 'gap-2.5 sm:gap-3 md:gap-4',
    standard: 'gap-4 sm:gap-5 md:gap-6',
    loose: 'gap-6 sm:gap-8 md:gap-10',
  },
  childPageHeroTop: {
    mobile: '1.25rem (20px)',
    largeMobile: '1.5rem (24px)',
    tablet: '2rem (32px)',
    desktop: '2.5rem (40px)',
    largeDesktop: '3rem (48px)',
    cssClass: 'page-child-hero-pt',
    utilityClasses: 'pt-5 sm:pt-6 md:pt-8 lg:pt-10 xl:pt-12',
  },
} as const;
