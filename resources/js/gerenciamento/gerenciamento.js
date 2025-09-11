// JS específico da página de Gerenciamento
(function(){
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('sidebarClose');
    if (toggle && sidebar) {
        toggle.addEventListener('click', function(){
            const isHidden = sidebar.classList.contains('d-none');
            sidebar.classList.toggle('d-none', !isHidden);
        });
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function(){
            sidebar.classList.add('d-none');
        });
    }
})();
