/**
 * Sistema Unificado de Loader - MANTENDO ESTÉTICA ATUAL
 */

class LoaderSystem {
    /**
     * @param {string|null} formId - id do formulário (opcional)
     * @param {string|null} loaderId - id do loader (opcional)
     */
    constructor(formId = null, loaderId = null) {
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
            loader: !!this.loader,
        });
    }

    findElements() {
        if (this.formId) {
            this.form = document.getElementById(this.formId);
            if (!this.form) {
                console.error(`❌ Formulário não encontrado: #${this.formId}`);
            }
        }
        if (this.loaderId) {
            this.loader = document.getElementById(this.loaderId);
            if (!this.loader) {
                console.error(`❌ Loader não encontrado: #${this.loaderId}`);
            }
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
