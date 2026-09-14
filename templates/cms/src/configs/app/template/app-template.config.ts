import { APP_CONFIG } from '../app.config';
import { ENV_CLIENT } from '../env/client.config';

export const APP_TEMPLATE_CONFIG = {
  brand: {
    name: ENV_CLIENT.APP_NAME,
    logoUrl: ENV_CLIENT.LOGO_URL,
    logoIconUrl: ENV_CLIENT.LOGO_ICON_URL,
    defaultTheme: 'modern',
    supportEmail: 'support@example.com',
  },
  features: APP_CONFIG.features.enabled,
  routing: APP_CONFIG.routing,
  auth: APP_CONFIG.auth,
} as const;
