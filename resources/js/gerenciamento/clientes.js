/**
 * Sistema de Gerenciamento de Clientes
 */
class ClienteSystem {
    constructor() {
        this.isInitialized = false;
        this.currentSearch = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🧑 Inicializando sistema de clientes');
        
        this.setupEventListeners();
        this.setupTableFeatures();
        this.setupAccessibility();
        this.isInitialized = true;
        
        console.log('✅ Sistema de clientes inicializado');
    }

    setupEventListeners() {
        // Listener para botões de ação
        this.setupActionButtons();
        
        // Listener para busca em tempo real
        this.setupSearchEnhancements();
        
        // Listener para filtros
        this.setupFilters();
    }

    setupActionButtons() {
        document.addEventListener('click', (e) => {
            // Botão de ver detalhes
            if (e.target.closest('.btn-view')) {
                e.preventDefault();
                this.handleViewClient(e.target.closest('.cliente-row'));
            }
            
            // Botão de conta fiada
            if (e.target.closest('.btn-wallet')) {
                e.preventDefault();
                this.handleWalletClient(e.target.closest('.cliente-row'));
            }
        });
    }

    setupSearchEnhancements() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        let searchTimeout;

        // Debounce para não fazer muitas buscas
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        // Enter para buscar imediatamente
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                this.performSearch(e.target.value);
            }
        });
    }

    setupTableFeatures() {
        // Adiciona hover effects
        this.setupTableHovers();
        
        // Adiciona ordenação se necessário
        this.setupTableSorting();
    }

    setupTableHovers() {
        const tableRows = document.querySelectorAll('.cliente-row');
        
        tableRows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                this.highlightRowInfo(row, true);
            });
            
            row.addEventListener('mouseleave', () => {
                this.highlightRowInfo(row, false);
            });
        });
    }

    setupTableSorting() {
        const headers = document.querySelectorAll('.clientes-table th');
        
        headers.forEach((header, index) => {
            if (index < 4) { // Só colunas que podem ser ordenadas
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(index, header.textContent);
                });
            }
        });
    }

    setupFilters() {
        // Filtros por saldo (se necessário implementar)
        this.setupSaldoFilters();
        
        // Filtros por data
        this.setupDateFilters();
    }

    setupSaldoFilters() {
        // Implementar filtros por tipo de saldo se necessário
        console.log('📊 Filtros de saldo disponíveis');
    }

    setupDateFilters() {
        // Implementar filtros por data se necessário
        console.log('📅 Filtros de data disponíveis');
    }

    setupAccessibility() {
        // Melhora acessibilidade da tabela
        this.enhanceTableAccessibility();
        
        // Adiciona navegação por teclado
        this.setupKeyboardNavigation();
    }

    enhanceTableAccessibility() {
        const table = document.querySelector('.clientes-table');
        if (table) {
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', 'Lista de clientes cadastrados');
        }

        const rows = document.querySelectorAll('.cliente-row');
        rows.forEach((row, index) => {
            row.setAttribute('role', 'row');
            row.setAttribute('aria-rowindex', index + 2); // +2 porque header é 1
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Esc para limpar busca
            if (e.key === 'Escape') {
                this.clearSearch();
            }
            
            // Ctrl+F para focar na busca
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }

    // MÉTODOS DE AÇÃO

    handleViewClient(row) {
        const clienteId = this.extractClientId(row);
        console.log('👁️ Visualizar cliente:', clienteId);
        
        // TODO: Implementar modal ou navegação para detalhes
        this.showClientDetails(clienteId);
    }

    handleWalletClient(row) {
        const clienteId = this.extractClientId(row);
        console.log('💰 Gerenciar conta fiada:', clienteId);
        
        // TODO: Implementar modal ou navegação para conta fiada
        this.showWalletManager(clienteId);
    }

    // MÉTODOS UTILITÁRIOS

    extractClientId(row) {
        const idElement = row.querySelector('.cliente-id');
        if (idElement) {
            const idText = idElement.textContent;
            const match = idText.match(/ID: (\d+)/);
            return match ? parseInt(match[1]) : null;
        }
        return null;
    }

    performSearch(searchTerm) {
        this.currentSearch = searchTerm;
        console.log('🔍 Buscando por:', searchTerm);
        
        // Como está usando React/Inertia, a busca é controlada pelo estado
        // Este método pode ser usado para analytics ou comportamentos extras
        this.logSearchEvent(searchTerm);
    }

    highlightRowInfo(row, highlight) {
        const badge = row.querySelector('.saldo-badge');
        if (badge && highlight) {
            badge.style.transform = 'scale(1.05)';
            badge.style.transition = 'transform 0.2s ease';
        } else if (badge) {
            badge.style.transform = 'scale(1)';
        }
    }

    sortTable(columnIndex, columnName) {
        console.log('📊 Ordenar por:', columnName);
        // Implementar ordenação se necessário
    }

    clearSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            // Trigger change event para React
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // MÉTODOS PARA FUTURAS IMPLEMENTAÇÕES

    showClientDetails(clienteId) {
        // TODO: Implementar visualização de detalhes
        console.log('🔍 Detalhes do cliente:', clienteId);
    }

    showWalletManager(clienteId) {
        // TODO: Implementar gerenciador de conta fiada
        console.log('💰 Conta fiada do cliente:', clienteId);
    }

    logSearchEvent(searchTerm) {
        // Log para analytics
        if (searchTerm.length > 2) {
            console.log('📊 Analytics: Busca realizada -', searchTerm);
        }
    }

    // MÉTODO DE RESET

    destroy() {
        this.isInitialized = false;
        console.log('🗑️ Sistema de clientes destruído');
    }
}

// Inicialização automática quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.ClienteSystem = new ClienteSystem();
});

// Export para uso global
window.ClienteSystem = ClienteSystem;