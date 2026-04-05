# Status dos Ajustes Gerais

Este arquivo acompanha o status da arquitetura e das telas sugeridas para o The Curator.

## 1. Home

- feito: saudacao mais humana
- feito: streak em destaque
- feito: XP do dia no topo
- feito: card principal com "Missao do dia"
- feito: CTA forte de continuidade
- feito: progresso por materia
- feito: revisao pendente
- feito: atividade recente
- parcial: progresso da missao ainda mistura dados reais e fallback

## 2. Trilhas

- parcial: existe tela de trilhas/planejamento com progresso e lista funcional
- nao feito: mapa vertical estilo Duolingo com nos conectados por tipo
- nao feito: estados visuais completos de aula, quiz, revisao, boss e simulado

## 3. Sessao de estudo

- feito: progresso, questoes, feedback e navegacao
- feito: sessao pode abrir questoes reais extraidas do PDF
- parcial: ainda nao cobre modos separados de aula, flashcard e resumo dentro da mesma sessao
- nao feito: tela final completa com XP ganho, erros e proxima missao

## 4. Biblioteca

- feito: upload real de PDF
- feito: status de processamento
- feito: excluir documento
- feito: abrir resumo, iniciar questoes e acionar flashcards
- parcial: acao "abrir" dedicada e fluxo de leitura ainda nao existem como tela propria

## 5. PDF Viewer + IA

- nao feito: viewer dedicado do PDF
- nao feito: sidebar inteligente da IA
- nao feito: selecao de texto com explicacao

## 6. Revisao inteligente

- parcial: biblioteca assumiu parte do papel de revisao
- nao feito: tela propria com buckets "revisar hoje", "atrasado" e "critico"

## 7. Simulado

- nao feito: configuracao de simulado
- nao feito: execucao com timer e score final

## 8. Analytics

- parcial: overview real ja existe
- parcial: cards e insights existem
- nao feito: graficos mais fortes e leitura aprofundada de pontos fracos

## 9. Perfil

- parcial: a bottom nav ja aponta para "Perfil"
- nao feito: tela propria de avatar, nivel, badges e historico

## 10. Configuracoes

- nao feito: tela de configuracoes

## Rotas / Arquitetura global

- parcial: o app ainda usa um shell unico com navegacao por estado
- nao feito: rotas dedicadas como `/app/home`, `/app/trilha`, `/app/sessao`, `/app/simulado`, `/app/revisao`, `/app/biblioteca`, `/app/pdf-viewer`, `/app/analytics`, `/app/perfil`, `/app/config`

