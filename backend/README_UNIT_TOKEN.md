# 🔑 Gerenciamento do BUYSYSTEM_UNIT_TOKEN

O `BUYSYSTEM_UNIT_TOKEN` é um token temporário que expira em **10 minutos**. Ele é usado para gerar tokens de acesso (`access_token`) que duram mais tempo (60 minutos) e tokens de refresh (30 dias).

## ⚠️ Problema Comum

Quando o UNIT token expira, você verá erros como:
- `Token inativo`
- `BUYSYSTEM_UNIT_TOKEN expirado ou inválido`
- `Erro interno no proxy BuySystem`

## ✅ Soluções

### 1. Renovação Manual (Rápida)

Execute no PowerShell:
```powershell
Invoke-WebRequest -Method POST -Uri "https://api.buysystem.com.br/scripts/gerar_token_admin.php"
```

Copie o token retornado e atualize no `.env`:
```env
BUYSYSTEM_UNIT_TOKEN=seu_novo_token_aqui
```

Reinicie o servidor Laravel:
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

### 2. Renovação via Comando Artisan (Recomendado)

O Laravel tem um comando que faz tudo automaticamente:

```bash
cd backend
php artisan buysystem:refresh-unit-token
```

Este comando:
- ✅ Busca um novo token da API BuySystem
- ✅ Atualiza automaticamente o `.env`
- ✅ Limpa o cache de configuração

### 3. Renovação via API Endpoint

Você também pode renovar via API (útil para scripts):

```bash
# Primeiro, obtenha o novo token
$token = (Invoke-WebRequest -Method POST -Uri "https://api.buysystem.com.br/scripts/gerar_token_admin.php").Content

# Depois, atualize via API
Invoke-WebRequest -Method POST -Uri "http://127.0.0.1:8000/api/tokens/refresh-unit" -Body (@{unit_token=$token} | ConvertTo-Json) -ContentType "application/json"
```

**Nota:** Esta atualização é temporária (apenas na memória). Para persistir, atualize o `.env` manualmente.

### 4. Renovação Automática (Cron Job)

Para produção, configure um cron job que renove o token automaticamente a cada 9 minutos:

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

## 📝 Fluxo de Tokens

```
UNIT Token (10 min) 
    ↓
Gera → Access Token (60 min) + Refresh Token (30 dias)
    ↓
Access Token expira → Usa Refresh Token para renovar
    ↓
Refresh Token expira → Precisa de novo UNIT Token
```

## 💡 Dicas

1. **Em desenvolvimento:** Use o comando `php artisan buysystem:refresh-unit-token` sempre que o token expirar
2. **Em produção:** Configure o cron job para renovação automática
3. **Monitoramento:** O endpoint `/api/tokens/test` mostra o status do token atual
