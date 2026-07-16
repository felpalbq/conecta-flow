# Multi-Tenancy — Conecta Flow

Estratégia de multi-tenancy. O isolamento é um princípio arquitetural, nunca uma funcionalidade opcional. O sistema é único; os dados são separados. Cada empresa enxerga apenas seu universo. Deve suportar milhares de empresas sem alterar a arquitetura.

## Modelo de isolamento

Estratégia: **shared database + shared schema + tenant identifier**.

- A entidade **Company** é o limite de isolamento. Todo objeto persistente pertence obrigatoriamente a uma Company — nunca existem registros órfãos.
- `company_id` obrigatório e indexado em **toda** tabela operacional, inclusive `messages` (ADR-006).
- Evolução futura possível (database/schema por tenant, infra dedicada) sem alterar o domínio.

## Regra fundamental

Nenhuma consulta de dados empresariais existe sem contexto de empresa. Toda requisição carrega: `user_id`, `company_id`, `permissions`, `session`.

**Nunca confiar no `company_id` enviado pelo frontend.** O frontend informa intenção; o backend valida autoridade a partir da sessão autenticada. O RLS garante o isolamento no banco como última camada.

## Usuários e memberships (ADR-001)

```
auth.users → profiles → company_memberships → companies
```

Um usuário pode pertencer a uma ou mais empresas. O membership define role, permissões e status por empresa. Papéis são limitadores iniciais; permissões são o controle real.

## Criação de empresa

Somente administrador ou fluxo autorizado:

```
Criar Company → configurações padrão → módulos padrão → usuário inicial → ambiente IA → evento company.created
```

## Isolamento por subsistema

| Subsistema | Regra |
|-----------|-------|
| **IA** | Cada empresa possui configuração, prompt, memória, conhecimento e documentos próprios. Nunca compartilhar conhecimento ou contexto entre empresas. |
| **Banco vetorial (pós-piloto)** | Espaço lógico por empresa (`company_id` + namespace). Nunca misturar embeddings. |
| **Memória do agente** | Curta: por conversa. Média: por empresa. Longa: por cliente da empresa. |
| **Integrações** | Credenciais próprias por empresa — nunca tokens globais. Uma empresa pode ter um ou múltiplos números de WhatsApp. |
| **Workflows** | O workflow (código) é compartilhado; os dados nunca. Todo workflow identifica o `company_id` do evento antes de executar (ver `integration-strategy.md`). |
| **Storage** | Isolamento lógico: `storage/{company_id}/...` |
| **Cache** | Chave sempre inclui `company_id`. Nunca cache compartilhado sem isolamento. |
| **Configurações** | Nunca globais. Toda configuração responde: "pertence a qual empresa?" |
| **Eventos e logs** | `company_id` obrigatório — rastreabilidade completa. |

## Mission Control

Única área que atravessa tenants (escopo platform). Mesmo assim: nunca modifica dados diretamente, toda operação usa contexto explícito da empresa e **toda ação é auditada**. Empresas acessam apenas os próprios registros de auditoria; o Mission Control possui visão global.

## Dados do cliente final

Pertencem sempre à empresa cliente (controladora) — nunca à plataforma (operadora). Toda empresa deve poder futuramente: exportar seus dados, receber histórico, solicitar remoção.

**Exclusão:** nunca imediata. Processo: solicitação → bloqueio → backup → anonimização/remoção (compatível com LGPD — ver `security-model.md`).

## Backup

Backups globais e criptografados; restauração possível por empresa, sempre preservando isolamento.

## Testes obrigatórios (CI)

- Empresa A não acessa dados da Empresa B.
- Usuário A não vê dados de B.
- IA de A não utiliza conhecimento de B.
- Workflow de A não executa em contexto de B.

## Regra final

Toda entidade pertence a exatamente uma Company. Toda operação acontece dentro de uma Company. Toda consulta respeita uma Company. Multi-tenancy não é funcionalidade — é propriedade fundamental do sistema.
