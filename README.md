# The Curator

Aplicação Next.js para estudos com interface premium, biblioteca funcional e pipeline local de documentos.

## Rodando localmente

Pré-requisito: Node.js 22 recomendado

1. Instale as dependências com `npm install`
2. Crie o arquivo `.env.local` com `GEMINI_API_KEY=sua_chave` se quiser manter a rota de IA ativa
3. Inicie o projeto com `npm run dev`

## O que já está funcional

- upload real de arquivos pela Biblioteca
- persistência local de documentos em `storage/documents`
- banco local em `data/the-curator-db.json`
- processamento de PDF com extração de texto via `pdf-parse`
- classificação inicial de matéria
- resumo, flashcards, tópicos e trilha derivados do documento
- exclusão em cascata do documento e dos dados derivados

## Rotas principais

- `GET /api/documents`
- `POST /api/documents`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id`
- `GET /api/documents/:id/file`
- `GET /api/overview`

## Arquitetura

O documento base da evolução funcional está em:

- `docs/the-curator-functional-architecture.md`

## Observações

- A chamada para a IA continua disponível pela rota `app/api/ai/route.ts`
- A chave da Gemini deve ficar em `GEMINI_API_KEY`, sem `NEXT_PUBLIC_`
- O build nesta sandbox ainda esbarra em `spawn EPERM` depois da checagem de tipos, mas a compilação e o lint passam localmente antes desse ponto
