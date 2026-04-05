# The Curator: Visão Geral do Projeto

Este documento descreve o estado atual do projeto **The Curator**: objetivo do produto, navegação, páginas, componentes globais, fluxo de documentos e integrações já existentes.

## 1. O que é o The Curator

O The Curator é uma plataforma de estudos com foco em:

- organização de rotina de estudo
- biblioteca de materiais em PDF
- processamento de documentos enviados pelo usuário
- geração de resumo, flashcards e trilha de estudo a partir do conteúdo
- acompanhamento de progresso e métricas de estudo
- apoio de IA via chat contextual

Hoje o projeto já combina:

- interface responsiva para mobile, tablet e desktop
- persistência local de estado da experiência do usuário
- backend local para upload e processamento de PDFs
- rotas de API para documentos e overview
- fluxo visual funcional entre onboarding, dashboard, plano, biblioteca, analytics e estudo

## 2. Estrutura Geral da Experiência

O app principal fica em [app/page.tsx](c:/Users/ADM/Documents/the-curator/app/page.tsx).

Ele orquestra:

- qual tela está ativa
- estado do onboarding
- tarefas do plano de estudo
- biblioteca de documentos
- overview da home e analytics
- sessão de estudo
- toasts de feedback
- modal do chat de IA

As telas principais atualmente são:

- `onboarding`
- `dashboard`
- `plan`
- `library`
- `analytics`
- `study`

## 3. Navegação Global

### Bottom Nav

O menu inferior fica em [app/components/curator/chrome.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/chrome.tsx).

Ele exibe 5 entradas:

- `Início` → `dashboard`
- `Plano` → `plan`
- `Biblioteca` → `library`
- `Analytics` → `analytics`
- `Questões` → `study`

Função prática:

- serve como navegação principal do app após o onboarding
- permanece fixa no rodapé
- funciona bem em mobile e também centralizada em telas maiores

### Header

Também em [app/components/curator/chrome.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/chrome.tsx).

Mostra:

- marca `The Curator`
- selo visual com `TC`
- badge de streak/XP

Função prática:

- reforça identidade do produto
- mantém o topo consistente em todas as telas internas

### Toasts

Componente `Toast` em [app/components/curator/chrome.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/chrome.tsx).

Usado para feedbacks como:

- upload iniciado
- upload concluído
- erro de upload
- documento removido
- material já analisado
- falha ao carregar biblioteca

### Modal de IA

Componente `AIChatModal` em [app/components/curator/chrome.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/chrome.tsx).

Funções:

- abrir um chat com IA
- receber contexto opcional de um documento ou situação
- enviar perguntas livres do usuário

Observação:

- a IA existe como apoio de interface, mas ainda não é o foco da base funcional principal neste estágio

## 4. Página por Página

### 4.1 Onboarding

Componente: [screens-core.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-core.tsx)

Objetivo:

- apresentar a proposta do app
- permitir que o usuário inicie a jornada
- preparar a transição para a experiência principal

O que exibe:

- marca do produto
- passo do fluxo
- cards de objetivo de estudo
- CTA `Iniciar Jornada`

O que faz hoje:

- ao concluir, marca que o onboarding foi finalizado
- direciona o usuário para a home
- persiste esse estado localmente

### 4.2 Início / Dashboard

Componente em uso: `DashboardOverviewScreen` em [screens-core.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-core.tsx)

Objetivo:

- servir como resumo executivo do estudo
- mostrar próximos passos e indicadores principais

Dados usados:

- overview vindo de `/api/overview`
- contexto de documentos e progresso geral

O que apresenta:

- visão geral do progresso
- quantidade de documentos enviados e analisados
- quantidade de questões extraídas
- flashcards gerados
- trilhas criadas
- sugestão de próxima continuidade

Função dentro do fluxo:

- é a página de entrada após o onboarding
- ajuda o usuário a retomar uma sessão ou seguir para biblioteca/plano

### 4.3 Plano

Componente: `PlanScreen` em [screens-core.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-core.tsx)

Objetivo:

- organizar tarefas de estudo do dia
- permitir controle de execução do plano

O que faz hoje:

- mostra progresso diário
- contabiliza tarefas totais e concluídas
- permite marcar tarefa como concluída
- permite criar tarefa nova
- permite excluir tarefa
- permite acionar recalcular plano

Dados:

- tarefas persistidas localmente
- ícones e estilos ligados ao tipo da tarefa

Função dentro do fluxo:

- transforma a rotina diária em uma sequência de ações executáveis

### 4.4 Biblioteca

Componente: `LibraryScreen` em [screens-content.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-content.tsx)

Objetivo:

- centralizar os materiais enviados pelo usuário
- mostrar status de processamento
- dar acesso às ações derivadas do documento

O que faz hoje:

- aceita upload real de arquivos PDF
- lista documentos existentes
- busca por título ou resumo
- filtra por status
- mostra contadores de materiais e materiais prontos
- mostra resumo rápido do documento
- permite excluir documento
- permite iniciar análise manual
- permite acionar:
  - `Gerar Flashcards`
  - `Iniciar Questões`
  - `Abrir Resumo`

Status atuais do documento:

- `idle` → aguardando análise
- `analyzing` → processando
- `analyzed` → processado com sucesso
- `failed` → falhou no backend

O que a página reflete:

- título extraído ou nome do arquivo
- tempo relativo de upload
- tamanho do arquivo
- resumo extraído
- contagem de questões
- contagem de flashcards
- possível erro de processamento

### 4.5 Analytics

Componente em uso: `AnalyticsOverviewScreen` em [screens-core.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-core.tsx)

Objetivo:

- consolidar métricas de estudo
- transformar atividade em leitura de desempenho

Dados usados:

- overview vindo de `/api/overview`
- métricas por assunto já agregadas no backend

O que apresenta hoje:

- visão resumida de documentos e estudo
- performance por assunto
- taxa de acerto
- progresso por matéria
- indicadores de atividade

Função dentro do fluxo:

- ajuda o usuário a entender volume, progresso e direção do estudo

### 4.6 Questões / Study

Componente: `StudyScreen` em [screens-content.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-content.tsx)

Objetivo:

- conduzir uma sessão de estudo baseada em perguntas
- registrar respostas e progresso

O que faz hoje:

- mostra questão atual
- mostra percentual concluído
- permite selecionar alternativa
- permite enviar resposta
- avança para próxima questão
- permite reiniciar sessão
- permite salvar para depois
- permite adicionar ao plano

Dados:

- progresso de estudo persistido localmente
- conjunto de questões da sessão atual

Observação:

- a sessão já é funcional no frontend, mas a integração completa com questões reais extraídas do PDF ainda pode evoluir mais

## 5. Fluxo do Documento PDF

O fluxo principal de documentos combina frontend, API, storage local e processamento no servidor.

### 5.1 Upload

No frontend:

- o usuário clica em `Adicionar material`
- o input aceita somente PDF
- os arquivos são enviados por [lib/services/documents.ts](c:/Users/ADM/Documents/the-curator/lib/services/documents.ts)

Na API:

- rota [app/api/documents/route.ts](c:/Users/ADM/Documents/the-curator/app/api/documents/route.ts)
- `POST /api/documents`
- valida arquivos recebidos
- aceita apenas PDF

### 5.2 Criação do registro

No backend:

- o documento é criado via serviço em [lib/server/documents-service.ts](c:/Users/ADM/Documents/the-curator/lib/server/documents-service.ts)
- o arquivo é salvo no storage local
- os metadados vão para a base local do projeto

### 5.3 Processamento

O processamento do conteúdo do PDF ocorre em:

- [lib/server/document-processing.ts](c:/Users/ADM/Documents/the-curator/lib/server/document-processing.ts)

Responsabilidades principais:

- extrair texto do PDF
- identificar título
- identificar assunto
- gerar resumo
- detectar tópicos
- estruturar dados derivados

### 5.4 Atualização da interface

No frontend:

- a página principal consulta `GET /api/documents`
- quando existe documento em `processing`, o app faz polling automático
- o card muda de estado até virar `analyzed` ou `failed`

## 6. API Atual

### `/api/documents`

Arquivo: [route.ts](c:/Users/ADM/Documents/the-curator/app/api/documents/route.ts)

Suporta:

- `GET` → lista documentos
- `POST` → envia PDFs para processamento

### `/api/documents/[id]`

Arquivo: [route.ts](c:/Users/ADM/Documents/the-curator/app/api/documents/[id]/route.ts)

Função:

- exclusão de um documento e seus derivados

### `/api/documents/[id]/file`

Arquivo: [route.ts](c:/Users/ADM/Documents/the-curator/app/api/documents/[id]/file/route.ts)

Função:

- acesso ao arquivo do documento salvo

### `/api/overview`

Arquivo: [route.ts](c:/Users/ADM/Documents/the-curator/app/api/overview/route.ts)

Função:

- devolver o overview usado por home e analytics

## 7. Persistência de Estado

### Persistência local do app

Arquivo: [storage.ts](c:/Users/ADM/Documents/the-curator/app/components/curator/storage.ts)

Hoje persiste:

- conclusão do onboarding
- última tela visitada
- tarefas do plano
- progresso da sessão de estudo

### Persistência de documentos

Backend local:

- metadados e derivados ficam persistidos na base local do projeto
- os arquivos enviados ficam no storage local do app

## 8. Tipos Principais

Arquivo central: [types.ts](c:/Users/ADM/Documents/the-curator/app/components/curator/types.ts)

Tipos importantes:

- `Screen` → telas navegáveis
- `Notification` → toasts
- `Doc` → documento da biblioteca
- `PlanTask` → tarefa do plano
- `StudyQuestion` → questão da sessão de estudo
- `StudyProgress` → progresso da sessão
- `OverviewSubjectMetric` → métrica por assunto
- `DashboardOverview` → resumo agregado da aplicação

## 9. Organização dos Componentes

### Camada de chrome

Arquivo: [chrome.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/chrome.tsx)

Contém:

- `Toast`
- `AIChatModal`
- `BottomNav`
- `Header`

### Camada de telas centrais

Arquivo: [screens-core.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-core.tsx)

Contém:

- onboarding
- dashboard
- plano
- analytics

### Camada de telas de conteúdo

Arquivo: [screens-content.tsx](c:/Users/ADM/Documents/the-curator/app/components/curator/screens-content.tsx)

Contém:

- biblioteca
- sessão de estudo

## 10. Estado Atual do Projeto

Hoje o projeto já faz de forma prática:

- sobe como app Next.js funcional
- mantém layout responsivo
- navega entre telas principais
- salva estado local do usuário
- aceita upload de PDF real
- lista e acompanha documentos enviados
- processa documento no backend local
- mostra feedback visual de processamento
- consolida overview para home e analytics
- permite exclusão de documentos
- oferece chat de IA contextual

## 11. Limitações Atuais e Próximos Passos Naturais

Pontos que ainda podem evoluir:

- tornar a extração de questões ainda mais robusta para diferentes formatos de prova
- aprofundar a integração da sessão de estudo com questões reais do documento
- enriquecer a página de analytics com mais métricas históricas
- ligar matérias e trilhas de forma mais explícita na interface
- revisar textos com encoding quebrado em alguns pontos do projeto
- substituir a base local por banco/storage de produção no futuro

## 12. Resumo Executivo

O The Curator já é mais do que um protótipo visual. Hoje ele possui:

- experiência navegável completa
- arquitetura de UI modular
- backend local funcional
- fluxo real de upload e processamento de PDF
- overview agregado para dashboard e analytics
- persistência de estado e dados

Em outras palavras: a base atual já permite evoluir o produto como aplicação real, sem precisar reconstruir o frontend do zero.
