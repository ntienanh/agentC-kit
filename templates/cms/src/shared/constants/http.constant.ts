
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  AUTHORIZATION: 'Authorization',
  CACHE_CONTROL: 'Cache-Control',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const DEFAULT_JSON_HEADERS = {
  [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
  [HTTP_HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
} as const;
