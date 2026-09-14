export const portalKeys = {
  all: ['portal'] as const,
  manifest: () => [...portalKeys.all, 'manifest'] as const,
  navigation: () => [...portalKeys.all, 'navigation'] as const,
};
