# Deploy na Hostinger — subdomínio com frontend + backend

Este guia explica como colocar o **Mirante Vue** (Vue + Laravel) em um **subdomínio** na **Hostinger**, com o site e a API no mesmo endereço.

**Caso prático (mirante.cassottis.com):** veja o arquivo **`DEPLOY-PASSO-A-PASSO.md`** com o passo a passo usando sua pasta `public_html/mirante`.

---

## 1. Resumo do que sobe no servidor

- **Pasta raiz do subdomínio** = pasta `public` do Laravel (`backend/public`).
- Nessa pasta ficam:
  - `index.php` → entrada do Laravel (rotas `/api/*`).
  - `index.html` → entrada do Vue (SPA); gerada no build.
  - `assets/` → JS/CSS do Vue (gerados no build).
  - `.htaccess` → envia `/api` para o Laravel e o resto para a SPA.

Ou seja: um único subdomínio serve tanto o site (Vue) quanto a API (Laravel).

---

## 2. Preparar o projeto para produção

### 2.1 Build do frontend e cópia para o backend

Na raiz do projeto (onde está o `package.json`):

```bash
npm run build:deploy
```

Isso faz:

1. `npm run build` → gera a pasta `dist/` (Vue).
2. `node scripts/copy-spa-to-backend.js` → copia `dist/index.html` e `dist/assets/` para `backend/public/`.

Assim, `backend/public/` fica pronta para ser usada como pasta raiz do subdomínio.

### 2.2 Conferir o `.htaccess`

O arquivo `backend/public/.htaccess` já está configurado para:

1. Enviar **`/api/*`** para `index.php` (Laravel).
2. Servir arquivos e pastas que existem (ex.: `/assets/...`).
3. Enviar qualquer outra rota para **`index.html`** (Vue SPA).

Não é necessário alterar nada se você não mudou esse arquivo.

---

## 3. Criar o subdomínio na Hostinger (hPanel)

1. Acesse o **hPanel** da Hostinger (painel da hospedagem).
2. Vá em **Domínios** (ou **Website** → **Domínios**).
3. Selecione o domínio principal e procure por **Subdomínios** (ou **Subdomains**).
4. Crie um novo subdomínio, por exemplo:
   - **Subdomínio:** `ingressos` (ou o nome que quiser).
   - **Domínio:** `seudominio.com.br`.
   - **Pasta raiz (Document Root):** aqui você vai apontar para a pasta onde ficará o conteúdo de `backend/public/` (veja a seção 4).

5. Anote o **caminho** da pasta do subdomínio (geralmente algo como `domains/seudominio.com.br/ingressos` ou dentro de `public_html`).

**Observação:** Na Hostinger, em alguns planos o diretório raiz do **domínio principal** não pode ser alterado. Para **subdomínios**, ao criar o subdomínio você normalmente pode escolher a pasta de destino. Se o painel permitir definir uma subpasta como raiz do subdomínio (ex.: `ingressos/public`), use isso para apontar direto para a pasta `public` do Laravel.

---

## 4. Onde colocar os arquivos e qual pasta usar como raiz

### Opção A — Pasta raiz do subdomínio = `public` do Laravel (recomendado)

1. Faça upload de **todo o projeto Laravel** (pasta `backend/` inteira) para o servidor. Exemplos de onde colocar:
   - Dentro da pasta do subdomínio: por exemplo `domains/seudominio.com.br/ingressos_app/` (ou o caminho que o hPanel mostrar para o subdomínio).
   - Estrutura no servidor: `ingressos_app/app/`, `ingressos_app/public/`, `ingressos_app/config/`, etc.

2. No hPanel, ao criar ou editar o subdomínio, defina a **pasta raiz (Document Root)** como a pasta **`public`** do Laravel, por exemplo:
   - `ingressos_app/public`  
   ou o caminho completo que a Hostinger usar (ex.: `domains/seudominio.com.br/ingressos_app/public`).

Assim, a URL do subdomínio serve apenas o que está dentro de `public/` (incluindo `index.html` e `index.php`). O restante do Laravel fica fora da pasta web (mais seguro).

**Se o hPanel não permitir** escolher uma subpasta como raiz do subdomínio, use a Opção B.

### Opção B — Conteúdo de `public` na raiz do subdomínio

Se você só puder escolher **uma pasta** para o subdomínio (ex.: `ingressos`) e não uma subpasta como `ingressos/public`:

1. Faça upload do **conteúdo** de `backend/public/` (tudo que está dentro: `index.php`, `index.html`, `.htaccess`, pasta `assets/`) para **dentro da pasta raiz do subdomínio** (ex.: a pasta `ingressos` que o painel criou).
2. Faça upload do **resto do Laravel** (pastas `app`, `bootstrap`, `config`, `database`, `routes`, `storage`, `vendor`, arquivos `.env`, `artisan`, etc.) para uma pasta **irmã** ou **acima**, por exemplo:
   - `ingressos_laravel/` (no mesmo nível da pasta do subdomínio).
3. Edite o `index.php` que está na raiz do subdomínio e ajuste os caminhos para apontar para a pasta onde está o restante do Laravel (geralmente as linhas com `__DIR__.'/../'` passam a apontar para `__DIR__.'/../ingressos_laravel/'` ou o caminho equivalente).

Essa opção é mais trabalhosa; prefira a Opção A se o painel permitir.

---

## 5. Enviar os arquivos para o servidor

- Pelo **Gerenciador de Arquivos** do hPanel (File Manager), ou
- Por **FTP** (credenciais em **Contas FTP** no hPanel), ou
- Por **SSH** (se seu plano tiver).

Certifique-se de que, após o upload:

- A **pasta raiz do subdomínio** é a pasta **`backend/public`** (onde estão `index.php`, `index.html`, `.htaccess` e `assets/`).
- As pastas **`storage`** e **`bootstrap/cache`** do Laravel existem e têm permissão de escrita (ex.: 775).

---

## 6. Configurar o `.env` no servidor

Na pasta **`backend/`** (não dentro de `public`), crie ou edite o arquivo `.env` com as variáveis de **produção**:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ingressos.seudominio.com.br

BUYSYSTEM_BASE_URL=https://ek55yrj95p.apidog.io
BUYSYSTEM_UNIT_TOKEN=seu_token_aqui
BUYSYSTEM_TOKEN_TYPE=site
BUYSYSTEM_PDV_ID=1
# ... demais variáveis BUYSYSTEM e banco, se houver
```

- Troque `https://ingressos.seudominio.com.br` pelo seu subdomínio real.
- Use o token e configurações corretas da API (incluindo `BUYSYSTEM_UNIT_TOKEN`).

Se usar banco de dados, configure também `DB_*` no `.env`.

---

## 7. PHP e permissões

- **Versão do PHP:** no hPanel, em **Configurações avançadas** ou **PHP**, selecione **PHP 8.1** ou **8.2** (compatível com Laravel 11).
- **Permissões:**  
  - `storage` e `bootstrap/cache`: graváveis pelo servidor (ex.: 775).  
  - Se der erro 500, confira os logs em `backend/storage/logs/laravel.log` e as permissões.

---

## 8. Testar

- **Site (SPA):**  
  `https://ingressos.seudominio.com.br/`  
  Deve abrir o Vue (lista de eventos, etc.).
- **API:**  
  `https://ingressos.seudominio.com.br/api/tokens/test`  
  Deve retornar JSON (status do token, etc.).

Se a API responder mas o site não, confira se a pasta raiz do subdomínio é mesmo a pasta `public` e se `index.html` e `assets/` estão nela.  
Se der 404 em rotas do Vue (ex.: `/eventos/1`), confira o `.htaccess` (regra que manda tudo que não é arquivo para `index.html`).

---

## 9. Resumo dos comandos (antes de subir)

```bash
# Na raiz do projeto
npm run build:deploy
```

Depois:

1. Enviar a pasta **backend** inteira para o servidor.
2. Definir a **pasta raiz do subdomínio** = `backend/public` (ou colocar o conteúdo de `public` na raiz do subdomínio, se não der para escolher subpasta).
3. Ajustar **.env** em `backend/` no servidor.
4. Ajustar **versão do PHP** (8.1 ou 8.2) e **permissões** de `storage` e `bootstrap/cache`.
5. Testar `/` e `/api/tokens/test`.

Com isso, o site e as APIs ficam no mesmo subdomínio na Hostinger.
