import { useTranslations } from 'next-intl';
import type { MessageNamespace, MessageSchema } from './messages';

type MessageAtPath<T, P extends string> = P extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? MessageAtPath<T[Head], Tail>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type DotNestedKeys<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object ? K | `${K}.${DotNestedKeys<T[K]>}` : K;
    }[Extract<keyof T, string>]
  : never;

type I18nValues = Record<string, string | number | boolean | Date | null | undefined>;
type StrictTranslator<N extends MessageNamespace> = (
  key: DotNestedKeys<MessageAtPath<MessageSchema, N>>,
  values?: I18nValues,
) => string;
type LooseTranslator = (key: string, values?: I18nValues) => string;

export function useI18n<N extends MessageNamespace>(namespace: N) {
  return useTranslations(namespace) as unknown as StrictTranslator<N> & LooseTranslator;
}
