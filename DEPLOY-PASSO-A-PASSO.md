# Deploy passo a passo — mirante.cassottis.com

Seu subdomínio: **mirante.cassottis.com**  
Pasta no servidor: **`/home/u349036361/domains/cassottis.com/public_html/mirante`**

Ou seja: quando alguém acessa `https://mirante.cassottis.com`, o servidor usa o que está **dentro** da pasta `mirante`.

---

## O que você vai fazer (resumo)

1. **No seu PC:** rodar o build e deixar a pasta `backend` pronta.
2. **No servidor:** enviar **toda** a pasta `backend` para **dentro** de `mirante` (e não “só o build”).
3. **No hPanel:** fazer o subdomínio apontar para a pasta **`mirante/public`** (e não para `mirante`).

Assim, a “porta de entrada” do site passa a ser `mirante/public` (onde estão `index.php`, `index.html`, `assets/`), e o resto do Laravel fica em `mirante/app`, `mirante/config`, etc., fora da web.

---

## Passo 1 — No seu computador (uma vez antes de subir)

Na **raiz do projeto** (onde está o `package.json`), no terminal:

```bash
npm run build:deploy
```

Isso:
- Gera o build do Vue (pasta `dist/`).
- Copia `index.html` e `assets/` para **dentro** de `backend/public/`.

Depois desse comando, a pasta `backend/public/` deve ter:
- `index.php` (Laravel)
- `index.html` (Vue)
- `.htaccess`
- pasta `assets/` (JS, CSS, imagens do Vue)

Ou seja: você **não** coloca “a pasta do build” em outro lugar; o build **já fica dentro** de `backend/public/`.

---

## Passo 2 — Estrutura no servidor (como deve ficar)

Você vai enviar **toda** a pasta **backend** para o servidor, de forma que o conteúdo dela fique **dentro** da pasta `mirante`.

No servidor, a estrutura deve ficar assim:

```
public_html/
  mirante/                    ← pasta do subdomínio (já existe)
    app/
    bootstrap/
    config/
    database/
    public/                   ← esta pasta será a “raiz” do site (ver passo 4)
      index.php
      index.html
      .htaccess
      assets/
        index-xxx.js
        index-xxx.css
        ...
    routes/
    storage/
    vendor/                   ← se você rodar composer no servidor, pode não enviar
    .env
    artisan
    composer.json
    ...
```

Ou seja:
- **Não** é: “colocar só o build em mirante”.
- **É:** colocar **todo o backend** dentro de `mirante` (incluindo a pasta `public` que já contém o build).

---

## Passo 3 — Enviar os arquivos

1. No seu PC, abra a pasta **`backend`** do projeto.
2. Selecione **tudo** que está dentro dela: `app`, `bootstrap`, `config`, `public`, `routes`, `storage`, `.env`, `artisan`, etc.
3. Envie (FTP ou Gerenciador de Arquivos do hPanel) para **dentro** de:
   - `public_html/mirante/`

Resultado: em `public_html/mirante/` você terá `app/`, `bootstrap/`, `config/`, **`public/`**, `routes/`, `storage/`, `.env`, etc.

Se a Hostinger criou a pasta `mirante` vazia (ou com um `index.html` padrão), você pode:
- apagar o conteúdo atual de `mirante` e colocar aí o conteúdo da pasta `backend`; ou
- entrar dentro de `mirante` e colocar cada pasta/arquivo no mesmo nível (para ficar como no desenho acima).

---

## Passo 4 — Ajustar a “pasta raiz” do subdomínio (importante)

Hoje o subdomínio **mirante.cassottis.com** está usando como “pasta raiz” a pasta **`mirante`**.  
Para o Laravel + Vue funcionarem certo, a “pasta raiz” do site precisa ser a pasta **`public`** que está **dentro** de `mirante`.

No **hPanel** da Hostinger:

1. Vá em **Domínios** (ou **Website** → **Domínios**).
2. Abra o domínio **cassottis.com** e procure por **Subdomínios**.
3. Localize o subdomínio **mirante** e edite (ou “Gerenciar”).
4. Onde estiver definido o **diretório raiz** / **Document Root** / **Pasta do subdomínio**, altere para:
   - **`public_html/mirante/public`**  
   ou o caminho completo:
   - **`/home/u349036361/domains/cassottis.com/public_html/mirante/public`**

Assim, quando alguém acessar `https://mirante.cassottis.com`, o servidor vai usar o que está em `mirante/public/` (ou seja, `index.php`, `index.html`, `.htaccess`, `assets/`).

Se o painel da Hostinger **não** permitir mudar a pasta raiz do subdomínio para uma subpasta (`mirante/public`), avise e a gente vê a alternativa (colocar o conteúdo de `public` direto em `mirante` e ajustar o `index.php`).

---

## Passo 5 — Configurar o .env no servidor

No servidor, edite o arquivo:

**`public_html/mirante/.env`**

(ou seja, o `.env` que está **fora** da pasta `public`, na raiz do Laravel.)

Deixe algo assim (ajuste com seus dados reais):

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://mirante.cassottis.com

BUYSYSTEM_BASE_URL=https://ek55yrj95p.apidog.io
BUYSYSTEM_UNIT_TOKEN=seu_token_aqui
BUYSYSTEM_TOKEN_TYPE=site
BUYSYSTEM_PDV_ID=1
```

- Troque `seu_token_aqui` pelo token que você usa na API.
- Se tiver banco de dados, preencha também as variáveis `DB_*`.

---

## Passo 6 — PHP e permissões

- No hPanel, defina a **versão do PHP** para **8.1** ou **8.2** (para o domínio/subdomínio).
- As pastas **`storage`** e **`bootstrap/cache`** (em `public_html/mirante/`) precisam ter permissão de escrita (por exemplo **775**). No Gerenciador de Arquivos você pode alterar permissões ao clicar com o botão direito na pasta.

---

## Resumo rápido

| Onde        | O que fazer |
|------------|-------------|
| No PC      | `npm run build:deploy` (build fica dentro de `backend/public/`) |
| No servidor| Enviar **toda** a pasta `backend` para **dentro** de `public_html/mirante/` |
| No hPanel  | Ajustar a pasta raiz do subdomínio para **`mirante/public`** |
| No servidor| Editar `mirante/.env` com `APP_URL=https://mirante.cassottis.com` e token |

Depois disso:
- **https://mirante.cassottis.com/** → deve abrir o site (Vue).
- **https://mirante.cassottis.com/api/tokens/test** → deve retornar JSON da API.

Se algo não funcionar (erro 500, 404, página em branco), diga o que aparece na tela ou no log (`storage/logs/laravel.log`) que a gente ajusta o próximo passo.
