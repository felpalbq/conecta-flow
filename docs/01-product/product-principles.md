# Product Principles — Conecta Flow

Estes princípios orientam todas as decisões de desenvolvimento. Sempre que existir dúvida entre duas abordagens técnicas, arquiteturais ou de UX, este documento prevalece. O objetivo não é criar o software mais completo — é criar o mais útil para pequenas empresas que atendem pelo WhatsApp.

## 1. A conversa é o centro do sistema

O Conecta Flow não é um CRM tradicional. Toda informação existe para enriquecer uma conversa. Lead Score ajuda durante a conversa; Agenda dá continuidade à conversa; Pagamento conclui uma conversa; Dashboard mostra o resultado das conversas.

## 2. O usuário trabalha na conversa

O operador nunca navega entre diversas telas para concluir um atendimento. A conversa concentra: mensagens, histórico, informações do contato, score, observações, arquivos, agendamentos, follow-ups e ações rápidas. Evitar abrir novas páginas.

## 3. A interface deve ser imediatamente familiar

O usuário já sabe usar o WhatsApp Business. Preservar: layout semelhante, comandos "/", respostas rápidas, anexos, emojis, atalhos de teclado. Nunca reinventar uma interface consolidada sem motivo extremamente forte.

## 4. IA é uma colaboradora

A IA faz parte da equipe: responde, qualifica, organiza, resume, acompanha, recupera oportunidades, executa tarefas. Não substitui o humano — quando necessário, solicita handoff.

## 5. O humano assume quando agrega valor

Nunca obrigar a IA a resolver tudo, nem obrigar o humano a tarefas repetitivas. O sistema encontra o equilíbrio entre automação e atendimento humano.

## 6. IA custa dinheiro

Cada chamada tem custo. Portanto: evitar chamadas desnecessárias, usar regras simples quando possível, reutilizar contexto, evitar processamento duplicado, **preferir decisões determinísticas antes da LLM**. A IA pensa apenas quando necessário.

## 7. Primeiro filtrar

Nem toda conversa merece processamento inteligente. Antes da qualificação existe triagem obrigatória: eliminar spam, enganos, contatos pessoais; identificar fornecedores e funcionários; reduzir processamento. Somente depois a conversa pode se tornar lead.

## 8. Lead não nasce automaticamente

Uma conversa não é um lead. Torna-se lead quando demonstra potencial comercial. Essa distinção reduz complexidade e melhora a qualidade das métricas.

## 9. O dashboard demonstra valor

Não existe para análise profunda. Mostra: economia, produtividade, resultados, oportunidades, atividades recentes. O usuário compreende rapidamente o impacto da plataforma.

## 10. O Core deve permanecer pequeno

Toda funcionalidade nova responde: fortalece o Core ou pertence a um módulo? Sempre que possível, módulos independentes.

## 11. O sistema cresce por capacidades

Novas funcionalidades são capacidades plugáveis (Agenda, Campanhas, Pagamento, Instagram, Landing Pages, Google Calendar, novos canais). Existe apenas um produto — os módulos apenas expandem suas capacidades. Nunca criar versões diferentes do sistema.

## 12. Multiempresa desde o primeiro dia

Toda decisão técnica considera: isolamento completo dos dados, segurança, permissões, escalabilidade, configuração independente. Nenhum recurso assume que existe apenas uma empresa.

## 13. O cliente administra o negócio, não a tecnologia

O usuário nunca configura: banco vetorial, prompts, workflows, integrações, modelos, banco de dados. Esses elementos pertencem ao Mission Control.

## 14. O Mission Control é outro produto

O painel administrativo não faz parte da experiência do cliente. Foco: operação, monitoramento, suporte, evolução, segurança, custos. Nunca misturar funcionalidades administrativas com o ambiente do cliente.

## 15. Segurança faz parte da arquitetura

Nunca adicionada posteriormente. Toda funcionalidade respeita: autenticação, autorização, isolamento, auditoria, rastreabilidade, menor privilégio possível.

## 16. Toda decisão deve reduzir complexidade

Antes de adicionar qualquer recurso: existe solução mais simples? O usuário realmente precisa disso? Isso reduz trabalho? Melhora o atendimento?

## Regra de Ouro

Toda funcionalidade deve responder positivamente a pelo menos uma destas perguntas:

1. Melhora uma conversa?
2. Melhora o resultado da conversa?
3. Melhora a operação da plataforma?

Se a resposta for negativa para todas, a funcionalidade não deve ser implementada.
