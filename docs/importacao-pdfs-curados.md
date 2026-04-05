# Importacao de PDFs Curados

Este fluxo existe para o modo hibrido do The Curator:

- parser automatico como fluxo principal
- curadoria manual assistida para PDFs que ainda quebram a extracao

## Objetivo

Permitir que um PDF real seja tratado manualmente e importado no projeto com:

- titulo limpo
- materia correta
- resumo confiavel
- topicos
- questoes estruturadas
- flashcards opcionais
- trilha opcional

## Rota pronta

`POST /api/documents/import`

## Estrutura do payload

```json
{
  "fileName": "PROVA B - AGENTE COMERCIAL - GABARITO 1.pdf",
  "sourcePdfPath": "C:/Users/ADM/Downloads/PROVA B - AGENTE COMERCIAL - GABARITO 1.pdf",
  "title": "PROVA B AGENTE COMERCIAL GABARITO 1",
  "subject": "Conhecimentos Bancarios",
  "summary": "Resumo tratado manualmente.",
  "topics": ["Linguagem", "Banco do Brasil"],
  "questions": [
    {
      "questionNumber": "1",
      "statement": "O trecho que explica o modo como se elabora uma deep fake e:",
      "options": [
        { "id": "A", "label": "Opcao A" },
        { "id": "B", "label": "Opcao B" },
        { "id": "C", "label": "Opcao C" },
        { "id": "D", "label": "Opcao D" },
        { "id": "E", "label": "Opcao E" }
      ],
      "correctAnswer": "C",
      "explanation": "Explicacao opcional.",
      "topic": "Lingua Portuguesa",
      "difficulty": "medium"
    }
  ],
  "flashcards": [
    {
      "question": "O que e deep fake?",
      "answer": "Tecnica de adulteracao de imagem, audio ou video com IA.",
      "topic": "Lingua Portuguesa",
      "difficulty": "easy"
    }
  ],
  "trail": {
    "title": "Trilha: Agente Comercial",
    "subject": "Conhecimentos Bancarios",
    "nodes": [
      {
        "title": "Questoes principais",
        "type": "exercise",
        "relatedQuestionNumbers": ["1"]
      }
    ]
  }
}
```

## Regras praticas

- `sourcePdfPath` deve apontar para um PDF real no disco
- `fileName` precisa terminar com `.pdf`
- `questions` precisa ter pelo menos uma questao
- cada questao precisa ter:
  - `questionNumber`
  - `statement`
  - pelo menos duas `options`
- `correctAnswer`, `explanation`, `flashcards` e `trail` sao opcionais

## O que o backend faz

- copia o PDF original para `storage/documents`
- cria o documento como `processed`
- grava questoes, flashcards e trilha no banco local
- atualiza analytics do documento
- deixa o PDF pronto para abrir na Biblioteca e iniciar questoes

## Uso operacional

Quando um PDF falhar no parser:

1. o PDF e analisado manualmente
2. um JSON curado e montado em `data/curated-imports/`
3. o JSON e enviado para `POST /api/documents/import`
4. o documento entra no app com dados reais tratados

## Observacao

Este fluxo nao substitui o parser automatico. Ele existe para destravar PDFs importantes enquanto a extracao automatica continua evoluindo.
