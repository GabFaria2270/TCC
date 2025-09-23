import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
    
    // ✅ ADICIONAR TIPAGENS DOS SISTEMAS JAVASCRIPT
    interface Window {
        LoaderSystem: any;
        ValidationSystem: any;
        ClienteSystem: any;
        RegisterSystem: any;
        LoginSystem: any;
        CNPJFormatter: any;
        PasswordToggle: any;
    }
}
