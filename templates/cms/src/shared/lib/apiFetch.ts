export const apiFetch = async (url: string | Request | URL, init?: RequestInit): Promise<Response> => {
  return globalThis['fetch'](url, init);
};
