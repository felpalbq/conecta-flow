# ADR-014 — Evolution API somente no piloto; gate de migração para Meta Cloud API

**Status:** Aceito · 2026-07-15

## Contexto

A Evolution API é uma integração não-oficial do WhatsApp: viola os termos de uso e implica risco real de banimento de número. É, porém, a via mais rápida e barata para validar o produto.

## Decisão

- Evolution API **exclusivamente no piloto interno**, com número dedicado (nunca número comercial crítico), rodando em VPS Docker.
- **Gate obrigatório:** migração para a Meta WhatsApp Cloud API **antes do primeiro cliente pagante**.
- O entregável real do Marco 2 é o **WhatsApp Adapter com interface normalizada** (`NormalizedMessage`) — a migração troca apenas o provider por trás do adapter.

## Consequências

- Validação rápida sem comprometer compliance de clientes.
- O domínio nunca conhece o provider; o custo da migração fica confinado ao adapter.
- Nenhum cliente externo opera sobre infraestrutura não-oficial.
