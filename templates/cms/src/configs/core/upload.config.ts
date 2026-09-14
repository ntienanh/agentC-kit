export const UPLOAD_CONFIG = {
  BYTES_IN_MB: 1024 * 1024,
  MAX_SIZE: 5 * 1024 * 1024,
  DEFAULT_MAX_FILES: 8,
  DEFAULT_ACCEPT: 'image/*',
  DEFAULT_LIST_TYPE: 'picture-card',
  ACCEPTED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  API_PATH: '/upload',
} as const;
