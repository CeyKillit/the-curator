# Curadoria Banco do Brasil

Este documento organiza os PDFs atuais do projeto em modulos de estudo reutilizaveis para trilhas, questoes e revisao.

## PDFs em uso

- `pdf/PROVA B - AGENTE COMERCIAL - GABARITO 1.pdf`
- `pdf/PDF_-_Livro_Digital-banco-do-brasil.pdf`

## Estrategia

- `Prova B - Agente Comercial`: separar por materia e por faixa oficial de questoes
- `Livro Digital Banco do Brasil`: separar por sumario, tema e subtema
- cada modulo tratado gera:
  - titulo limpo
  - materia
  - resumo curto
  - topicos
  - questoes
  - trilha com nos de resumo, exercicio e revisao

## Prova B - Agente Comercial

Faixas oficiais identificadas no proprio caderno:

- `1 a 10`: Lingua Portuguesa
- `11 a 15`: Lingua Inglesa
- `16 a 20`: Matematica
- `21 a 25`: Atualidades do Mercado Financeiro
- `26 a 30`: Matematica Financeira
- `31 a 40`: Conhecimentos Bancarios
- `41 a 55`: Conhecimentos de Informatica
- `56 a 70`: Vendas e Negociacao

Modulo em preparacao:

- `Lingua Portuguesa`
  - faixa: `1 a 10`
  - status: `texto limpo extraido`
  - base de trabalho: [prova-b-agente-comercial-lingua-portuguesa.json](/c:/Users/ADM/Documents/the-curator/data/curation-workbench/prova-b-agente-comercial-lingua-portuguesa.json)
  - trilha sugerida:
    - leitura do texto-base `deep fake`
    - bloco de questoes 1 a 10
    - revisao de erros
    - simulado rapido de portugues

## Livro Digital Banco do Brasil

Recorte inicial do sumario util para modularizacao:

- `Portugues`
  - Acentuacao Grafica
  - Ortografia
  - Emprego das Classes de Palavras
  - Sintaxe da Oracao
  - Sintaxe do Periodo Composto
  - Pontuacao
  - Concordancia
  - Regencia
  - Crase
  - Colocacao Pronominal
  - Coesao e Coerencia
  - Significacao das Palavras
  - Argumentacao e Persuasao
  - Linguagem Assertiva
  - Organizacao Textual
  - Tipologia Textual
  - Interpretacao de Texto
  - Redacao Oficial
- `Lingua Inglesa`
  - Pronouns
  - Verb Tenses
  - Modal Verbs
  - Conjunctions
  - Vocabulary
  - Word Formation
  - Text Comprehension
- `Matematica`
  - Numeros inteiros, racionais e reais
  - Problema de contagem
  - Sistema legal de medidas
  - Razoes e proporcoes
  - Regra de tres simples
  - Regra de tres composta
  - Porcentagem
  - Logica proposicional
  - Nocoes de conjuntos
  - Funcoes
- `Atualidades do Mercado Financeiro`
  - bancos na era digital
  - internet banking
  - mobile banking
  - open banking
  - fintechs
  - pix
- `Conhecimentos Bancarios`
  - sistema financeiro nacional
  - produtos bancarios
  - mercado de capitais
  - mercado de cambio

Modulo ja curado:

- [livro-digital-bb-portugues-acentuacao-grafica.json](/c:/Users/ADM/Documents/the-curator/data/curated-imports/livro-digital-bb-portugues-acentuacao-grafica.json)
- [livro-digital-bb-portugues-ortografia.json](/c:/Users/ADM/Documents/the-curator/data/curated-imports/livro-digital-bb-portugues-ortografia.json)

## Uso pratico no app

- os modulos do livro viram trilhas por tema
- os modulos da prova viram revisao por materia e simulados segmentados
- a fila de erros do backend reaproveita as questoes desses modulos para repetir apenas o que o usuario errou

## Proximo lote recomendado

1. Curar `PROVA B - Lingua Portuguesa (1 a 10)` com gabarito validado
2. Curar `Livro Digital - Portugues - Crase`
3. Curar `Livro Digital - Portugues - Emprego das Classes de Palavras`
4. Curar `Livro Digital - Matematica - Porcentagem`
