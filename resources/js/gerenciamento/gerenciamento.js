// JS específico da página de Gerenciamento
(function () {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('sidebarClose');

    if (!sidebar) return;

    const MOBILE_OPEN_CLASS = 'sidebar-open';
    const HIDDEN_CLASS = 'd-none';

    const setExpanded = (expanded) => {
        if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
    };

    const openSidebar = () => {
        sidebar.classList.remove(HIDDEN_CLASS);
        document.body.classList.add(MOBILE_OPEN_CLASS);
        setExpanded(true);
        attachOutsideClick();
    };

    const closeSidebar = () => {
        sidebar.classList.add(HIDDEN_CLASS);
        document.body.classList.remove(MOBILE_OPEN_CLASS);
        setExpanded(false);
        detachOutsideClick();
    };

    const toggleSidebar = () => {
        const isHidden = sidebar.classList.contains(HIDDEN_CLASS);
        if (isHidden) openSidebar();
        else closeSidebar();
    };

    let outsideHandler;
    const attachOutsideClick = () => {
        if (outsideHandler) return;
        outsideHandler = (e) => {
            const isLarge = window.matchMedia('(min-width: 992px)').matches; // lg breakpoint
            if (isLarge) return; // Em telas grandes, sidebar fica fixa
            if (!sidebar.contains(e.target) && e.target !== toggle) {
                closeSidebar();
            }
        };
        document.addEventListener('click', outsideHandler);
    };

    const detachOutsideClick = () => {
        if (!outsideHandler) return;
        document.removeEventListener('click', outsideHandler);
        outsideHandler = null;
    };

    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
        });
    }

    // Ajusta estado ao redimensionar: no desktop mantém sempre visível e sem overlay
    const handleResize = () => {
        const isLarge = window.matchMedia('(min-width: 992px)').matches;
        if (isLarge) {
            sidebar.classList.remove(HIDDEN_CLASS);
            document.body.classList.remove(MOBILE_OPEN_CLASS);
            setExpanded(false);
            detachOutsideClick();
        } else {
            // Em mobile, sidebar inicia escondida
            sidebar.classList.add(HIDDEN_CLASS);
            document.body.classList.remove(MOBILE_OPEN_CLASS);
            setExpanded(false);
            detachOutsideClick();
        }
    };
    window.addEventListener('resize', handleResize);
    // Chamada inicial para alinhar com o breakpoint atual
    handleResize();
})();

// Controles de acessibilidade (A+, A-)
(function () {
    const BTN_INC = document.getElementById('a11y-font-inc');
    const BTN_DEC = document.getElementById('a11y-font-dec');

    const BASE_SIZE = 18; // 1.125rem ~ 18px
    const MIN = 16;
    const MAX = 22;

    const load = (k, d) => {
        try {
            const v = localStorage.getItem(k);
            return v ? JSON.parse(v) : d;
        } catch {
            return d;
        }
    };
    const save = (k, v) => {
        try {
            localStorage.setItem(k, JSON.stringify(v));
        } catch {}
    };

    let fontSize = load('a11y.fontSize', BASE_SIZE);

    const applyFont = () => {
        document.documentElement.style.fontSize = fontSize + 'px';
    };

    applyFont();

    BTN_INC?.addEventListener('click', () => {
        fontSize = Math.min(MAX, fontSize + 1);
        applyFont();
        save('a11y.fontSize', fontSize);
    });
    BTN_DEC?.addEventListener('click', () => {
        fontSize = Math.max(MIN, fontSize - 1);
        applyFont();
        save('a11y.fontSize', fontSize);
    });
})();
