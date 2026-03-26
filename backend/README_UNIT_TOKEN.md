# Gerenciamento de Tokens BuySystem

Fluxo atual recomendado:
- `POST https://api.buysystem.com.br/scripts/gerar-token-init` -> retorna `bootstrap_token`
- `POST /v2/auth/ativar` -> retorna `access_token` (e pode retornar `refresh_token`)
- `POST /v2/auth/refresh` -> renova o `access_token` usando `refresh_token`

## Problema comum

Quando o token expira, você verá erros como:
- `Token inativo`
- `Erro interno no proxy BuySystem`

## Soluções

### 1. Configuração base no `.env`

```env
BUYSYSTEM_BASE_URL=https://api.buysystem.com.br/v2
BUYSYSTEM_TOKEN_TYPE=site
BUYSYSTEM_PDV_ID=1
BUYSYSTEM_INIT_USER_ID=1
BUYSYSTEM_INIT_MINUTES=120
BUYSYSTEM_ACCESS_MINUTES=120
BUYSYSTEM_REFRESH_DAYS=30
```

### 2. Validação via comando Artisan (recomendado)

O Laravel tem um comando que faz tudo automaticamente:

```bash
cd backend
php artisan buysystem:refresh-unit-token
```

Este comando:
- valida `gerar-token-init`
- valida `auth/ativar`
- atualiza variáveis de configuração no `.env`
- limpa cache de configuração

Ele **não sobrescreve** `BUYSYSTEM_UNIT_TOKEN`; o fluxo principal continua sendo `gerar-token-init` + `auth/ativar`.

O `BUYSYSTEM_UNIT_TOKEN` é usado apenas como fallback legado quando a API não retorna `refresh_token` no fluxo novo.

### 3. Renovação automática (cron)

O refresh de `access_token` acontece automaticamente no client.  
Para manter configuração e validação periódica em produção, rode o comando a cada 15 minutos:

**Windows (Task Scheduler):**
1. Abra o Agendador de Tarefas
2. Crie uma nova tarefa
3. Configure para executar a cada 9 minutos:
   ```
   php C:\Users\Rafa\projetos\mirante-vue\backend\artisan buysystem:refresh-unit-token
   ```

**Linux/Mac (Crontab):**
```bash
*/9 * * * * cd /caminho/para/backend && php artisan buysystem:refresh-unit-token >> /dev/null 2>&1
```

## 🔍 Diagnóstico

Para verificar se o token está funcionando:

```bash
# Teste o endpoint de diagnóstico
curl http://127.0.0.1:8000/api/tokens/test
```

Ou abra no navegador: `http://127.0.0.1:8000/api/tokens/test`

## Fluxo de tokens

```
Bootstrap Token (120 min)
    ↓
Ativar unidade → Access Token (ex.: 2h) + Refresh Token
    ↓
Access Token expira → usa /v2/auth/refresh
    ↓
Refresh token falha/expira → novo ciclo gerar-token-init + ativar
```

## Dicas

1. Em desenvolvimento, rode `php artisan buysystem:refresh-unit-token` após alterar credenciais.
2. Em produção, deixe o cron + monitoramento de `/api/tokens/test`.
3. Evite depender de `BUYSYSTEM_UNIT_TOKEN` para o fluxo novo.

4. `BUYSYSTEM_UNIT_TOKEN` pode continuar configurado para fallback legado; o sistema tenta refresh automaticamente pelo `refresh_token` primeiro.
