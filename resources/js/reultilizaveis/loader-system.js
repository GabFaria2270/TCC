/**
 * Sistema Unificado de Loader - MANTENDO ESTÉTICA ATUAL
 */

class LoaderSystem {
    constructor(formId, loaderId) {
        this.formId = formId;
        this.loaderId = loaderId;
        this.form = null;
        this.loader = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.findElements();
        this.bindEvents();
        
        console.log(`🔧 LoaderSystem (${this.formId}):`, {
            form: !!this.form,
            loader: !!this.loader
        });
    }

    findElements() {
        this.form = document.getElementById(this.formId);
        this.loader = document.getElementById(this.loaderId);
        
        if (!this.form) {
            console.error(`❌ Formulário não encontrado: #${this.formId}`);
        }
        
        if (!this.loader) {
            console.error(`❌ Loader não encontrado: #${this.loaderId}`);
        }
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            console.log(`✅ Event listener adicionado ao #${this.formId}`);
        }
    }

    handleSubmit(event) {
        console.log(`📤 Formulário ${this.formId} submetido`);
        
        if (this.loader) {
            this.mostrarLoader();
        }
    }

    // MANTÉM A LÓGICA ATUAL DO LOADER
    mostrarLoader() {
        if (this.loader) {
            this.loader.style.display = 'flex';
            this.iniciarAnimacaoLoader();
            console.log(`🔄 Loader ${this.loaderId} ativado`);
        }
    }

    esconderLoader() {
        if (this.loader) {
            this.loader.style.display = 'none';
            this.pararAnimacaoLoader();
        }
    }

    // MANTÉM A ANIMAÇÃO ATUAL
    iniciarAnimacaoLoader() {
        const img = this.loader.querySelector('#imgloader') || this.loader.querySelector('.imgloader');
        if (img) {
            img.style.display = 'block';
            console.log(`🎬 Animação iniciada`);
        }
    }

    pararAnimacaoLoader() {
        const img = this.loader.querySelector('#imgloader') || this.loader.querySelector('.imgloader');
        if (img) {
            img.style.display = 'none';
        }
    }
}

// Exporta para uso global
export default LoaderSystem;
console.log('📦 LoaderSystem carregado');