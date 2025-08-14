Chat - Usina Educação

Página estática de chat minimalista para integrar com n8n.

Arquivos:
- `index.html` — UI do chat (Tailwind via CDN). O webhook n8n já está configurado no arquivo.

Como funciona:
- O usuário informa o nome e escolhe um entre seis agentes.
- Ao enviar uma mensagem, o front envia um POST JSON para o webhook n8n.

Exemplo de payload enviado para o n8n:
{
  "user": "Nome do usuário",
  "agent": "Agente escolhido",
  "message": "Texto enviado",
  "timestamp": "ISO timestamp"
}

Resposta esperada do n8n:
- O workflow deve responder com JSON contendo `reply` (string) ou `replies` (array) — o front exibirá o conteúdo.

Deploy (Cloudflare Pages - grátis):
1. Crie um repositório GitHub com estes arquivos.
2. No Cloudflare Pages, conecte o repositório e publique (site estático).
3. O Pages faz deploy automático a cada push.

Histórico via n8n + Supabase (sugestão):
- Excelente ideia: usar n8n como orquestrador e Supabase como banco (Postgres) para armazenar conversas.
- Fluxo sugerido no n8n:
  1. Webhook (POST) — recebe o payload do front.
  2. (Opcional) Auth/validação — verificar token ou conteúdo.
  3. Node Supabase/HTTP (inserir linha na tabela `messages`) — salve { user, agent, message, reply, timestamp }.
  4. Node que gera/obtém a resposta (ex.: chamada a LLM ou lógica de negócio).
  5. Atualizar registro no Supabase com a resposta (ou inserir uma nova linha para mensagem do agente).
  6. Responder ao front com JSON { reply }.

Vantagens:
- Histórico centralizado e pesquisável.
- Permite auditoria, análise e reuso de conversas.
- Supabase tem plano gratuito com limites adequados para prototipagem.

Pontos a considerar:
- Cuidado com dados sensíveis — aplique políticas de retenção e criptografia quando necessário.
- Se houver alto volume, avalie custos do Supabase (planos pagos) e otimizações (compactação, TTL).

Quer que eu:
- atualize o `index.html` para também salvar localmente um histórico simples em `localStorage` antes do envio ao webhook?
- ou gere um exemplo de workflow n8n (passo-a-passo) que integra Supabase e responde com `reply`? 
