export const apiFetch = async (url: string | Request | URL, init?: RequestInit) => {
  return globalThis['fetch'](url, init);
};
