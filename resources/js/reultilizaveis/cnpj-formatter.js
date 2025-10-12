/**
 * Sistema de Formatação de CNPJ - Versão Compacta
 */

class CNPJFormatter {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupCNPJ();
        });
    }

    setupCNPJ() {
        const cnpjFields = document.querySelectorAll('input[name="COMERCIO_CNPJ"], #COMERCIO_CNPJ');
        
        cnpjFields.forEach(field => {
            field.setAttribute('maxlength', '18');
            field.setAttribute('placeholder', '00.000.000/0000-00');
            
            field.addEventListener('input', (e) => this.format(e));
            field.addEventListener('keydown', (e) => this.onlyNumbers(e));
            
            if (field.value) this.format({ target: field });
        });
        
        console.log('✅ CNPJ Formatter ativo');
    }

    format(event) {
        const field = event.target;
        const numbers = field.value.replace(/\D/g, '');
        
        // Formatação: XX.XXX.XXX/XXXX-XX
        let formatted = numbers;
        if (numbers.length > 2) formatted = numbers.slice(0, 2) + '.' + numbers.slice(2);
        if (numbers.length > 5) formatted = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5);
        if (numbers.length > 8) formatted = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '/' + numbers.slice(8);
        if (numbers.length > 12) formatted = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '/' + numbers.slice(8, 12) + '-' + numbers.slice(12, 14);
        
        field.value = formatted;
        
        // Feedback visual
        if (numbers.length === 14 && this.isValid(numbers)) {
            field.style.borderColor = '#28a745';
        } else if (numbers.length > 0) {
            field.style.borderColor = numbers.length === 14 ? '#dc3545' : '#007bff';
        } else {
            field.style.borderColor = '';
        }
    }

    onlyNumbers(event) {
        const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (allowed.includes(event.key) || (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))) return;
        if (!/\d/.test(event.key)) event.preventDefault();
    }

    isValid(cnpj) {
        if (/^(\d)\1{13}$/.test(cnpj)) return false;
        
        let sum = 0, weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for (let i = 0; i < 12; i++) sum += cnpj[i] * weights[i];
        let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (cnpj[12] != digit1) return false;
        
        sum = 0; weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for (let i = 0; i < 13; i++) sum += cnpj[i] * weights[i];
        let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return cnpj[13] == digit2;
    }
}

export default CNPJFormatter;