import { router } from '@inertiajs/react';

export function useInertiaPut() {
  return async (url: string, data: any, options: { onSuccess?: () => void, onError?: (errors: any) => void } = {}) => {
    router.put(url, data, {
      preserveScroll: true,
      onSuccess: options.onSuccess,
      onError: options.onError,
    });
  };
}
