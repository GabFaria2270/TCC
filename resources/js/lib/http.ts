import axios from 'axios';

function getCsrfToken() {
    if (typeof document === 'undefined') return null;
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null;
}

const http = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

http.interceptors.request.use((config) => {
    const token = getCsrfToken();
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)['X-CSRF-TOKEN'] = token;
    }
    return config;
});

export default http;
