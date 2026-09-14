import type { MessageSchema } from '@/shared/i18n';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends MessageSchema {}
}
