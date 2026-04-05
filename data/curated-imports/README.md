# Imports Curados

Esta pasta recebe arquivos JSON preparados manualmente para importar PDFs tratados no The Curator.

Fluxo:

1. o PDF original e analisado manualmente
2. as questoes, resumo e topicos sao estruturados em JSON
3. o backend importa esse JSON via `POST /api/documents/import`
4. o PDF original e copiado para `storage/documents`
5. o documento entra no app como `processed`

O schema esperado esta documentado em:

- `docs/importacao-pdfs-curados.md`
