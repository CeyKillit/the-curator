# Pendencias do The Curator

Backlog atual do produto. Itens marcados com ✅ ja foram implementados.

---

## Arquitetura global

✅ Migrar shell para rotas dedicadas (`/home`, `/trilhas`, `/sessao`, `/simulado`, `/revisao`, `/biblioteca`, `/pdf-viewer/[id]`, `/analytics`, `/perfil`, `/config`)
✅ Contexto global React (CuratorContext) substituindo hook monolitico
✅ CSS corrigido com tokens do Tailwind v4

---

## Gamificacao

✅ XP, moedas e streak reais persistidos no banco
✅ Header com XP, moedas e streak em tempo real
✅ Toast de recompensa ao acertar questao (+15 XP, +3 moedas)
✅ Missao diaria com progresso real (10 questoes/dia)
✅ Tela de Perfil com avatar, nivel, barra de XP, estatisticas e conquistas
✅ 6 conquistas com desbloqueio automatico por regras de negocio
✅ Mapa de trilha visual estilo Duolingo com nos em zigzag, linha SVG e animacao de pulso

- Badges persistidos por conquista com data de desbloqueio visivel no perfil
  Motivo: o campo `unlockedAt` existe no banco mas ainda nao e exibido na UI.

- Loja de recompensas com troca de moedas por beneficios
  Motivo: o sistema de moedas esta pronto, mas ainda nao existe UI de loja.

---

## Trilhas

- Cada no abrir a sessao correta vinculada ao seu tipo e conteudo real
  Motivo: o mapa visual ja funciona com nos reais do backend, mas o clique ainda navega de forma generica (por PDF).

- Tipos Boss e Simulado como nos nativos da trilha
  Motivo: o simulado existe como experiencia separada, mas nao esta plugado como tipo de no.

✅ Progressao automatica de no ao concluir sessao (reloadTrails apos cada resposta)

---

## Sessao de estudo

- Final de sessao com revisao filtrada pelos erros reais daquela rodada
  Motivo: o filtro de erros existe, mas depende de historico granular por questao ainda nao persistido.

✅ Modo Flashcard dentro da sessao (tela dedicada com flip de card, auto-progressao, revisao dos erros)

---

## PDF Viewer + IA

- Selecao de texto no PDF para explicacao pela IA
  Motivo: o viewer usa iframe, sem controle de selecao fino.

- Criar questoes a partir de trecho selecionado no PDF
  Motivo: depende de selecao de bloco + envio ao backend.

- Configurar chave Gemini no app e ativar IA real
  Motivo: usuario ainda nao tem a chave; mock ja funciona como fallback.

---

## Revisao inteligente

- Bucket real de questoes erradas com historico verdadeiro por questao e data
  Motivo: a fila local de erros existe, mas falta persistencia de eventos granulares no backend.

- Spaced repetition real baseado em desempenho individual por questao
  Motivo: exige camada de agendamento de revisao alem da contagem de documentos.

---

## Simulado

- Timer por secao (alem do timer global)
  Motivo: o timer unico por sessao ja existe; falta estrutura de blocos/secoes.

- Navegacao livre por grade de questoes
  Motivo: a experiencia atual e linear por simplicidade.

✅ Persistencia historica de simulados realizados com analytics dedicado

---

## Analytics e Perfil

- Ampliar analytics com revisao, simulados e historico temporal comparativo
  Motivo: a tela atual usa bem o `overview`, mas falta camada historica.

- Historico de atividade e timeline pessoal no Perfil
  Motivo: falta persistir eventos individuais suficientes para um historico detalhado.

---

## Configuracoes

- Persistir preferencias reais (tema, notificacoes, idioma, conta)
  Motivo: a tela existe mas ainda e estrutural, sem persistencia.

---

## Infra e Processamento

- Melhorar extracao de questoes de prova (enunciado + alternativas)
  Motivo: o parser evoluiu bastante, mas ainda falha em gabaritos nao padronizados e PDFs com diagramacao irregular.

- Adicionar OCR para PDFs escaneados/imagem
  Motivo: o parser atual nao consegue extrair texto de PDFs sem texto embutido.

✅ Migrar storage e banco locais para infraestrutura de producao (Supabase — banco PostgreSQL + Storage para PDFs)

## Autenticacao

✅ Tela de login com email+senha e Google OAuth
✅ Middleware de protecao de rotas
✅ Callback OAuth com Supabase SSR
✅ Pagina 404 animada estilizada

## Deploy

✅ Deploy na Vercel com URL publica (sem dominio proprio)
