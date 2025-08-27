# Dev Container para Codespaces

Este projeto está pronto para rodar no GitHub Codespaces ou em qualquer ambiente que suporte devcontainers.

## O que está incluso

- PHP 8.2
- Node.js 20
- Composer
- MySQL 8.0 (usuário: tcc_user, senha: tcc_pass, banco: tcc_db)
- Extensões recomendadas para VS Code: Intelephense, Xdebug, Prettier

## O que acontece ao abrir no Codespaces

- Instala dependências PHP (`composer install`)
- Instala dependências Node.js (`npm install`)
- Banco MySQL já configurado e disponível
- Variáveis de ambiente para conexão com banco já definidas

## O que você pode precisar ajustar

- Copie o arquivo `.env.example` para `.env` e ajuste se necessário
- Rode as migrations: `php artisan migrate`
- Para rodar o servidor Laravel: `php artisan serve --host=0.0.0.0 --port=8000`
- Para rodar o Vite: `npm run dev`

Pronto! O ambiente estará pronto para desenvolvimento.
