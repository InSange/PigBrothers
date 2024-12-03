'use client';

import { Api } from './Api';

type CustomHeader = { Authorization: string | undefined | null };
export const apiClient = new Api<CustomHeader>({
  baseURL: 'https://wam-coin.store/',
  // baseURL: 'http://localhost:8000/',
});

apiClient.instance.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem(
      window.location.hostname + '.accessToken'
    );
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers['Authorization'] = `Bearer ${accessToken}`;
    config.headers['X-Timezone'] = clientTimeZone;
  }
  return config;
});

apiClient.instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
        localStorage.removeItem(window.location.hostname + '.accessToken');
        localStorage.removeItem(window.location.hostname + '.workspaceId');
      }
    }

    return Promise.reject(error);
  }
);
