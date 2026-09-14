export const REGEX_CONFIG = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  PHONE: /(84|0[35789])+(\d{8})\b/,

  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,

  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
