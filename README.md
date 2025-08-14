Chat - Usina Educação

Página estática de chat minimalista para integrar com n8n.

 Página estática de chat minimalista para integrar com n8n.

 ## Estrutura do repositório
 - `index.html` — UI do chat (Tailwind via CDN). Contém o placeholder `__WEBHOOK_URL__` que é substituído em build.
 - `scripts/build.sh` — script simples que injeta `WEBHOOK_URL` em `dist/index.html` (usado pelo Cloudflare Pages).
 - `dist/` — pasta de saída do build (gerada pelo `scripts/build.sh`).
 - `worker/index.js` — (opcional) Cloudflare Worker que age como proxy para esconder o webhook real.
 - `wrangler.toml` — template para configurar o Worker com Wrangler.
 - `k6-script.js` — script de carga (k6) para testes de carga simples.

 ## Visão geral
 - O frontend envia um POST JSON com { user, agent, message, timestamp } para um endpoint webhook (n8n).
 - O n8n deve responder com JSON contendo `reply` (string) ou `replies` (array). O frontend exibe o texto retornado.

 ## Build e deploy — Cloudflare Pages (recomendado)

 1. No repositório do GitHub, conecte o projeto ao Cloudflare Pages.
 2. Em "Build settings" configure:
   - Build command: `sh scripts/build.sh`
   - Build output directory: `dist`
 3. Adicione a variável de ambiente `WEBHOOK_URL` nas Environment variables do Pages (Production/Preview, conforme necessário). Essa variável será usada pelo `scripts/build.sh` para substituir `__WEBHOOK_URL__` no `index.html` final.
 4. Deploy automático ocorrerá a cada push.

 Observação: o `scripts/build.sh` aborta se `WEBHOOK_URL` não estiver definido, evitando commits acidentais com webhook embutido.

 ## Opção segura: usar um Cloudflare Worker como proxy (recomendado para esconder o webhook)

 Vantagem: o frontend faz POST para o Worker público e o Worker encaminha para o webhook n8n que fica guardado como segredo no Cloudflare (não exposto no cliente).

 Passos básicos:
 1. Instale o Wrangler (se ainda não): `npm install -g wrangler`.
 2. Autentique: `wrangler login`.
 3. No `worker/wrangler.toml` (ou no `wrangler.toml` na raiz) configure o `name` e `account_id` conforme sua conta.
 4. Adicione o segredo do webhook ao Worker:
   - `wrangler secret put WEBHOOK_URL` (ele solicitará o valor e salvará como segredo).
 5. Publique o Worker: `wrangler publish worker` (ou conforme sua configuração).

 ## Execução local e desenvolvimento

 - Para um teste rápido local você pode copiar `index.html` e substituir temporariamente `__WEBHOOK_URL__` pelo seu webhook n8n (não comitar essa mudança).
 - Para reproduzir o comportamento de produção localmente, exporte `WEBHOOK_URL` e execute o build:
   - `export WEBHOOK_URL="https://seu-webhook-n8n"`
   - `sh scripts/build.sh`
   - Abra `dist/index.html` no navegador.

 ## k6 — teste de carga simples

 Arquivo: `k6-script.js` — simula múltiplos usuários enviando mensagens ao webhook.

 Exemplo de execução local (precisa ter o k6 instalado):
 - `k6 run k6-script.js`

 Observação: o teste deve apontar para o endpoint que irá tratar as requisições (pode ser o Worker proxy ou o webhook n8n direto). Use os resultados para dimensionar os workers do n8n.

 Recomendação baseada em teste preliminar: para um fluxo I/O-bound simples, começar com 8 workers n8n e ajustar com base em CPU/p95/queue.

 ## Exemplo de payload enviado ao n8n

 ```json
 {
   "user": "Nome do usuário",
   "agent": "Agente escolhido",
   "message": "Texto enviado",
   "timestamp": "ISO timestamp"
 }
 ```

 Resposta esperada do n8n (exemplos aceitos pelo frontend):

 - `{ "reply": "Texto de resposta" }`
 - `{ "replies": ["Parte 1", "Parte 2"] }`

 O frontend também tenta inspecionar formatos comuns vindos do n8n, então retornar `{ output: [...] }` ou estruturas aninhadas normalmente funciona.

 ## Troubleshooting / notas

 - Se o deploy falhar: confirme que `WEBHOOK_URL` está configurado nas Environment variables do Pages.
 - Scroll do chat quebrado em mobile: garantir que o build não tenha sido alterado; o CSS inclui `min-height: 0` em containers flex — se customizar CSS, preserve essa propriedade para permitir rolagem.
 - Evite expor `WEBHOOK_URL` no repositório. Use build-time injection (Pages env) ou Worker proxy com segredo.

 ## Workflow n8n sugerido (resumo)

 1. Webhook (HTTP Request) — recebe o POST do frontend.
 2. Validação / autenticação (opcional).
 3. Persistência em Supabase (opcional) — armazena mensagem recebida.
 4. Processamento (LLM / regras) — gerar resposta.
 5. Atualizar o histórico e responder ao frontend com `{ reply }`.

 ## Próximos passos que posso fazer por você

 - Gerar um exemplo detalhado de workflow n8n que integra Supabase e grava histórico.
 - Atualizar `index.html` para salvar o histórico localmente em `localStorage` antes de enviar ao webhook.
 - Automatizar o deploy com GitHub Actions (injetando `WEBHOOK_URL` apenas em Pages via secrets).

 Escolha uma dessas opções ou diga o que prefere que eu implemente a seguir.
