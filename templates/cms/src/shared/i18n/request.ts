import type { AbstractIntlMessages } from 'next-intl';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { loadMessages } from './loadMessages';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [messages, fallbackMessages] = await Promise.all([
    loadMessages(locale),
    locale !== routing.defaultLocale ? loadMessages(routing.defaultLocale) : Promise.resolve(null),
  ]);

  const mergedMessages = fallbackMessages ? mergeMessages(fallbackMessages, messages) : messages;

  return {
    locale,
    messages: mergedMessages,
    getMessageFallback({ key, namespace }) {
      void namespace;
      const parts = key.split('.');
      return parts[parts.length - 1] ?? '';
    },
  };
});

function mergeMessages<T extends AbstractIntlMessages>(base: T, override: T): T {
  const result = { ...base };
  for (const ns of Object.keys(override) as (keyof T)[]) {
    const baseValue = base[ns];
    const overrideValue = override[ns];
    result[ns] = deepMergeValue(baseValue, overrideValue) as T[keyof T];
  }
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMergeValue(baseValue: unknown, overrideValue: unknown): unknown {
  if (!isRecord(baseValue) || !isRecord(overrideValue)) {
    return overrideValue;
  }

  const result = { ...baseValue };
  for (const key of Object.keys(overrideValue)) {
    result[key] = deepMergeValue(baseValue[key], overrideValue[key]);
  }
  return result;
}
