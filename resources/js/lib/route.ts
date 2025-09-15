import routeJs from 'ziggy-js';
import { usePage } from '@inertiajs/react';

export function useRoute() {
  const { props } = usePage();
  const ziggy = (props as any)?.ziggy;

  function r(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: Record<string, any> | any,
    absolute?: boolean,
  ): string {
    if (!ziggy) {
      if (typeof name === 'string' && name.startsWith('/')) return name;
      return '#';
    }
    try {
      return (routeJs as any)(name, params, absolute, ziggy);
    } catch {
      if (typeof name === 'string' && name.startsWith('/')) return name;
      return '#';
    }
  }

  return { route: r };
}
