# The Curator: Arquitetura Funcional

## A. Diagnóstico do que hoje ainda está fictício

- Home, Trilhas, Matérias e Analytics ainda usam cards e indicadores majoritariamente estáticos.
- O progresso geral do usuário ainda não vem de sessões reais persistidas no backend.
- A sessão de estudo já ficou mais real no frontend, mas ainda não consome questões extraídas do documento atual.
- A página de Analytics ainda não consome a rota de overview/metrics criada no backend.
- A Home ainda não usa dados reais de `nextTrail`, documentos analisados e estudos recentes.
- O sistema ainda não possui autenticação real; neste estágio existe um `local-user` técnico para permitir persistência funcional sem quebrar a UI.

## B. Arquitetura proposta

### Frontend

- `app/page.tsx` continua como orquestrador principal da experiência atual.
- `app/components/curator/*` preserva a UI existente.
- Biblioteca passa a consumir `GET/POST/DELETE /api/documents`.
- Próximas etapas:
  - Home consumir `GET /api/overview`
  - Analytics consumir `GET /api/overview`
  - Study consumir `GET /api/documents/:id/questions`

### Backend/API

- `app/api/documents/route.ts`
  - `GET`: lista documentos reais persistidos
  - `POST`: recebe upload real, salva arquivo, processa PDF e persiste derivados
- `app/api/documents/[id]/route.ts`
  - `GET`: retorna documento individual
  - `DELETE`: exclusão em cascata com cleanup dos derivados
- `app/api/overview/route.ts`
  - agrega métricas reais do banco local

### Storage

- Arquivos enviados ficam em `storage/documents`

### Database

- Banco local em arquivo JSON: `data/the-curator-db.json`
- Repositórios:
  - `lib/server/database.ts`
  - `lib/server/documents-service.ts`

### Pipeline de processamento

- `lib/server/document-processing.ts`
  - extração de texto do PDF com `pdf-parse`
  - classificação de matéria
  - extração heurística de questões reais
  - geração de resumo estruturado
  - geração de flashcards
  - criação de trilha

## C. Estrutura de dados

- `users`
- `documents`
- `questions`
- `flashcards`
- `trails`
- `trailNodes`
- `studySessions`
- `analytics`

Tipos centrais foram definidos em:

- `lib/server/types.ts`
- `app/components/curator/types.ts`

## D. Fluxo completo do PDF

1. Usuário seleciona um ou mais arquivos na Biblioteca.
2. Frontend envia `multipart/form-data` para `POST /api/documents`.
3. Backend salva o arquivo em `storage/documents`.
4. Backend registra metadados iniciais do documento no banco local.
5. Pipeline extrai texto do PDF.
6. Pipeline detecta título, matéria, tópicos e resumo.
7. Pipeline tenta extrair questões reais já existentes no documento.
8. Pipeline gera flashcards e trilha a partir do conteúdo extraído.
9. Banco persiste documento, questões, flashcards, trilha, nós e métricas derivadas.
10. Biblioteca reflete o documento processado.

## E. Integração página por página

### Biblioteca

- Já conectada a upload real, listagem real e exclusão real.
- Ações atuais:
  - enviar documento
  - listar documentos persistidos
  - excluir documento e derivados
  - iniciar estudo somente quando houver questões extraídas

### Trilhas

- Backend já gera `study_trails` e `trail_nodes`.
- Próxima etapa:
  - renderizar trilhas reais na tela dedicada
  - usar nós e progresso persistido

### Matérias

- Backend já classifica o documento por matéria.
- Próxima etapa:
  - agrupar documentos e desempenho por matéria

### Home

- `GET /api/overview` já fornece base para substituir números mockados.
- Próxima etapa:
  - próxima trilha real
  - documentos analisados
  - questões extraídas
  - flashcards gerados

### Analytics

- Rota de overview já existe.
- Próxima etapa:
  - acurácia real
  - sessões reais
  - progresso por matéria
  - tempo estudado

## F. Plano de implementação por etapas

### Fase 1

- Base backend local
- Upload real
- Persistência real
- Processamento de PDF
- Exclusão em cascata

### Fase 2

- Conectar Home e Analytics ao `overview`
- Exibir trilhas reais
- Exibir contagem real de questões/flashcards nos cards

### Fase 3

- Consumir questões extraídas reais na sessão de estudo
- Persistir study sessions
- Atualizar analytics com taxa de acerto e tempo real

### Fase 4

- Substituir storage local por bucket/cloud storage
- Substituir JSON db por banco real
- Adicionar autenticação

## G. Base técnica criada

- `lib/server/database.ts`
- `lib/server/document-processing.ts`
- `lib/server/documents-service.ts`
- `lib/server/types.ts`
- `app/api/documents/route.ts`
- `app/api/documents/[id]/route.ts`
- `app/api/overview/route.ts`

## H. Regras de negócio

### Exclusão

- exclusão do documento remove:
  - registro do documento
  - questões derivadas
  - flashcards derivados
  - trilha associada
  - nós da trilha
  - arquivo salvo no storage local

### Extração de questões

- prioridade para questões já existentes no PDF
- se não houver bloco com enunciado + alternativas, o documento segue como teórico

### Resumo

- sempre baseado no texto extraído do documento
- não usa analytics fictício
- não vira chat genérico

### Flashcards

- gerados a partir dos tópicos e do resumo real do documento

### Analytics

- neste estágio inicial são derivados dos dados persistidos do pipeline
- a próxima fase liga study sessions e acurácia real do usuário
