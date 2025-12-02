import { useEffect, useState } from 'react';

export default function useMediaQuery(query: string): boolean {
    const getMatches = (q: string): boolean => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(q).matches;
    };

    const [matches, setMatches] = useState<boolean>(() => getMatches(query));

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        setMatches(mediaQueryList.matches);

        try {
            mediaQueryList.addEventListener('change', listener);
        } catch {
            mediaQueryList.addListener(listener);
        }

        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}
