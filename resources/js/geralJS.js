// Importações organizadas - MANTENDO ARQUIVOS EXISTENTES
import './app.js';
import './home/home.js';

// Sistemas reutilizáveis (novos)
import './reultilizaveis/loader-system.js';
import './reultilizaveis/password-toggle.js';
import './reultilizaveis/validation-system.js';
import './reultilizaveis/cnpj-formatter.js';

// Sistemas específicos (refatorados)
import './cadastro/cadastro.js';
import './login/login.js';
import './gerenciamento/gerenciamento.js';
import './login/rate-limiting.js';
import './cadastro/rate-limiting.js';

