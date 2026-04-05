# Auditoria do App - 2026-03-29

## Achados principais

### Critico

- O documento `PROVA B - AGENTE COMERCIAL - GABARITO 1.pdf` foi salvo como `processed`, mas com dados derivados incorretos no banco local.
Motivos observados:
  - `extractedSubject` ficou como `Tecnologia`, embora a prova tenha varias materias e o bloco inicial valido fosse `Lingua Portuguesa`
  - `extractedSummary` ficou poluido por instrucoes do caderno, texto de redacao e encoding quebrado
  - varias questoes foram montadas com alternativas incompletas ou contaminadas por trechos da materia seguinte
  - houve transbordamento de conteudo da pagina seguinte para dentro de opcoes da questao 10

- A base de questoes ficou inconsistente para estudo, revisao e trilhas.
Impacto:
  - sessoes de estudo podem abrir itens com enunciado/alternativas errados
  - revisao aprende em cima de dados ruins
  - trilhas e analytics passam a refletir progresso sobre conteudo invalido

### Alta

- O documento curado `Livro Digital BB - Portugues - Acentuacao Grafica` ficou melhor que a prova automatica, mas a base runtime ja apresenta sinais de divergencia.
Motivos observados:
  - `extractedQuestionIds` no banco local somam `11`, embora o JSON curado principal tenha `10` questoes
  - isso sugere adicao manual posterior ou descompasso entre curadoria e runtime

- O banco local atual mistura:
  - importacao curada valida
  - parser automatico ainda instavel
  - eventos de revisao e trilha dependentes desses dados

### Media

- Os PDFs brutos em `pdf/` estao bons para trabalho manual, mas os derivados em `storage/documents` nao sao mais confiaveis como base de produto.

## Decisao tomada

Para reconstruir com seguranca:

- limpar a base runtime atual
- remover PDFs importados da area usada pelo app
- preservar apenas:
  - os PDFs brutos em `pdf/`
  - os workbenches de curadoria
  - a documentacao de separacao por materia

## Escopo do reset

Itens a limpar:

- `documents`
- `questions`
- `flashcards`
- `trails`
- `trailNodes`
- `studySessions`
- `analytics`
- `questionAttempts`
- `reviewStates`
- arquivos em `storage/documents`

Itens preservados:

- `users`
- PDFs brutos em `pdf/`
- arquivos de apoio em `data/curation-workbench/`
- documentacao em `docs/`

## Proximo estado recomendado

Reconstruir por camadas:

1. Curar por materia e por faixa de questoes
2. Validar gabarito antes de importar
3. Subir apenas modulos confiaveis para o app
4. So depois religar revisao, trilha e analytics a esses modulos
