# MVP Specification — Conecta Flow

Escopo funcional da primeira versão utilizável. O MVP é a primeira versão capaz de: operar atendimento real, utilizar IA, organizar contatos, realizar handoff humano e gerar percepção clara de valor.

A execução do MVP está fatiada em 4 marcos com critérios de aceite (ver `docs/03-execution/implementation-plan.md`).

## Usuário-alvo inicial

Micro e pequenas empresas que recebem contatos pelo WhatsApp, atendem manualmente, perdem oportunidades e precisam reduzir esforço operacional. Piloto interno: operação do fundador (soluções digitais para MPEs).

## Funcionalidades Core obrigatórias

### 1. Autenticação
Login, logout, recuperação de senha, controle de sessão (Supabase Auth). Não inclui OAuth nem múltiplos métodos. **Critério:** usuário autorizado acessa somente suas empresas.

### 2. Multi-tenancy
Criação de empresas, vínculo usuário-empresa via memberships, isolamento de dados com RLS. **Critério:** Empresa A nunca visualiza dados da Empresa B (comprovado por teste automatizado).

### 3. Usuários
Criação, ativação/desativação, permissões básicas. Roles iniciais: `Company Owner` e `Attendant`. Não inclui supervisor nem hierarquia complexa.

### 4. Inbox
Tela principal do produto — deve lembrar o WhatsApp Web. Inclui: lista de conversas, conversa ativa, histórico, envio/recebimento em tempo real, status, emoji, anexos, mídia, respostas rápidas. Não inclui múltiplos canais inicialmente.

### 5. Conversas
Status: `new → in_triage → active → waiting_customer → closed → archived`; responsável separado: `ai | user | queue` (ADR-007). Ações: assumir, devolver para IA, transferir.

### 6. Contatos
Cadastro, histórico, informações básicas, tags, classificação. Campos iniciais: nome, telefone, origem, status, score, observações.

### 7. Triagem Inteligente
Primeira ação sobre toda mensagem nova: regras determinísticas primeiro, LLM econômica depois. Categorias: `unknown / irrelevant / personal_contact / existing_customer / potential_lead`. Somente clientes e leads potenciais avançam para atendimento inteligente.

### 8. Agente Inteligente
Responder dúvidas, consultar conhecimento (FAQ estruturado por empresa — RAG fica pós-piloto, ADR-013), coletar informações, classificar, sugerir próxima ação. Não toma decisões críticas sem regra definida.

### 9. Handoff
IA → humano, humano → IA, humano → humano. Registrar motivo, responsável e horário. Gera eventos.

### 10. Follow-up
Identificar contatos parados, sugerir retomada, enviar mensagens. Inicialmente fluxos simples/manuais — automação completa fica pós-piloto.

### 11. Dashboard
Indicadores simples: conversas atendidas, leads identificados, tempo de resposta, atendimentos pela IA, transferências humanas, oportunidades recuperadas. Não inclui analytics avançado.

### 12. Mission Control inicial
Empresas, usuários, status, consumo básico (tokens/custo IA por empresa), erros. Mesma aplicação, rota `/admin` (ADR-011).

## Prioridade de interface

1. Inbox → 2. Contatos → 3. Home → 4. Dashboard → 5. Configurações

## Fluxos principais

**Novo contato:** cliente envia mensagem → WhatsApp → sistema recebe → triagem IA → classificação → resposta → handoff se necessário.

**Atendimento humano:** IA atende → atendente assume → conversa continua → finaliza → IA pode retomar.

**Lead parado:** contato sem resposta → sistema identifica → follow-up → reativação.

## Fora do MVP

Agendamento, pagamentos, campanhas, landing pages, Instagram, analytics avançado e CRM pipeline kanban (não representa a filosofia do produto). RAG, n8n e Meta Cloud API entram pós-piloto interno.

## Critérios de sucesso

A empresa consegue: cadastrar usuários, receber mensagens, visualizar conversas, responder, usar IA, transferir atendimento, organizar contatos e visualizar resultados.

**Critério comercial** — o produto deve permitir demonstrar: quantos atendimentos foram automatizados? Quantos clientes foram recuperados? Quanto trabalho humano foi reduzido?

## Regra final

O MVP não é um CRM com IA. É um sistema de conversa inteligente com gestão de relacionamento. A conversa é o centro.
