<div align="center">
	<img src="docs/assets/cover.jpeg" alt="Mais Conectado - Tela inicial" width="960" />
	<h1>Mais Conectado</h1>
	<p><strong>Conexão simples para pequenos negócios</strong></p>
	<p>Gestão de produtos, clientes, vendas e crédito fiado de forma moderna, rápida e acessível.</p>
	<p><a href="https://maisconectado.alwaysdata.net" target="_blank">Acessar DEMO online</a></p>
</div>

---

## ✨ Visão Geral
Mais Conectado é uma plataforma web construída com Laravel (PHP) e frontend progressivo que oferece:
- Controle de produtos, estoque e movimentações
- Cadastro e gestão de clientes
- Sistema de vendas com itens e totalização
- Módulo de crédito fiado transparente (limites, histórico, parcelas)
- Autenticação com fluxo de sessão + token "lembre-me" otimizado
- SEO preparado (sitemap.xml, robots.txt, meta tags, JSON-LD Organization)

## 🚀 Tecnologias Principais
| Camada | Stack |
|--------|-------|
| Backend | Laravel 12, PHP 8+ |
| Frontend | Blade + Vite (modular CSS/JS) |
| Build | Vite + ESBuild |
| Testes | Pest / PHPUnit |
| Cache / Sessões | Laravel Cache / Session |
| SEO | Sitemap, Robots, Structured Data |

## 📷 Imagem de Capa
Substitua `docs/assets/cover.png` por um screenshot real da tela inicial (1920x1080 recomendado). Para aparecer como preview social no GitHub, crie também `docs/assets/social-preview.png` (1280x640) e configure em Settings > Social preview.

## 🗂️ Estrutura Simplificada
```
public/            # Arquivos públicos (index.php, sitemap, favicon, logo)
resources/views/   # Blade templates (home, login, cadastro, componentes)
resources/css/     # Estilos segmentados (home, navbar, etc.)
app/Models/        # Modelos: Produto, Categoria, Cliente, Venda...
app/Http/Middleware/RequireTokenOrSession.php  # Middleware otimizado de sessão/token
database/migrations/  # Estrutura das tabelas
tests/            # Testes Pest / PHPUnit
```

## 🔐 Fluxo de Autenticação "Lembre-me"
1. Sessão ativa sempre tem prioridade
2. Token persistente só recria sessão se válido e usuário não estiver autenticado
3. Invalidar token não força logout imediato se sessão estável existir
4. Middleware unifica lógica (verificação cache + DB)

## 🧪 Testes Rápidos
Execute a suíte básica:
```bash
php artisan test
```
Ou com Pest:
```bash
./vendor/bin/pest
```

## ⚙️ Instalação
```bash
git clone <repo>
cd TCC
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run build   # ou npm run dev para ambiente de desenvolvimento
php artisan serve
```

## 🌐 SEO & Indexação
- `public/sitemap.xml` gera estrutura para indexação
- `public/robots.txt` permite crawl geral
- JSON-LD em `public/organization.json` descreve a marca
- Meta tags otimizadas na `home.blade.php`

## 🛠 Próximas Melhorias Sugeridas
- Painel analítico (gráficos de vendas e estoque)
- API REST para integrações externas
- Filas (queue) para notificações e e-mails
- Internacionalização completa (multi-idioma)

## 🤝 Contribuição
Pull requests são bem-vindos. Abra uma issue com contexto claro. Mantenha padrão PSR-12 e escreva pelo menos um teste para novas regras de negócio.

## 📄 Licença
MIT. Sinta-se livre para usar e adaptar com atribuição.

## 🧾 Créditos
Baseado em arquitetura Laravel moderna + ajustes personalizados para fluxo de sessão/token e SEO.

---
Se este projeto ajudou você, considere dar uma ⭐ no repositório!
