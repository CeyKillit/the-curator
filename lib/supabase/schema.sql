-- ============================================================
-- The Curator — Supabase Schema
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Estudante',
  email TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  last_study_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usuário local padrão
INSERT INTO users (id, name, email)
VALUES ('local-user', 'Estudante', 'local@thecurator.app')
ON CONFLICT (id) DO NOTHING;

-- Documentos PDF
CREATE TABLE IF NOT EXISTS pdf_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (processing_status IN ('uploaded','processing','processed','failed')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_analyzed BOOLEAN NOT NULL DEFAULT FALSE,
  extracted_title TEXT NOT NULL DEFAULT '',
  extracted_subject TEXT NOT NULL DEFAULT 'Geral',
  extracted_summary TEXT NOT NULL DEFAULT '',
  extracted_topics TEXT[] NOT NULL DEFAULT '{}',
  extracted_question_ids TEXT[] NOT NULL DEFAULT '{}',
  extracted_flashcard_ids TEXT[] NOT NULL DEFAULT '{}',
  generated_trail_id TEXT,
  processing_error TEXT,
  deleted_at TIMESTAMPTZ
);

-- Questões extraídas
CREATE TABLE IF NOT EXISTS extracted_questions (
  id TEXT PRIMARY KEY,
  pdf_id TEXT NOT NULL REFERENCES pdf_documents(id),
  question_number TEXT NOT NULL DEFAULT '',
  statement TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT,
  explanation TEXT,
  topic TEXT NOT NULL DEFAULT 'Geral',
  difficulty TEXT NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  pdf_id TEXT NOT NULL REFERENCES pdf_documents(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'Geral',
  difficulty TEXT NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trilhas de estudo
CREATE TABLE IF NOT EXISTS study_trails (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pdf_id TEXT NOT NULL REFERENCES pdf_documents(id),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','in_progress','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nós das trilhas
CREATE TABLE IF NOT EXISTS trail_nodes (
  id TEXT PRIMARY KEY,
  trail_id TEXT NOT NULL REFERENCES study_trails(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('module','topic','exercise','review','summary')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed')),
  "order" INTEGER NOT NULL DEFAULT 0,
  related_question_ids TEXT[] NOT NULL DEFAULT '{}',
  related_flashcard_ids TEXT[] NOT NULL DEFAULT '{}'
);

-- Sessões de estudo
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pdf_id TEXT,
  trail_id TEXT,
  subject TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  questions_solved INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  flashcards_reviewed INTEGER NOT NULL DEFAULT 0
);

-- Métricas de analytics
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  accuracy_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  questions_solved INTEGER NOT NULL DEFAULT 0,
  flashcards_reviewed INTEGER NOT NULL DEFAULT 0,
  study_time INTEGER NOT NULL DEFAULT 0,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tentativas de questões
CREATE TABLE IF NOT EXISTS question_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  question_id TEXT NOT NULL,
  pdf_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  correct_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Estados de revisão (spaced repetition)
CREATE TABLE IF NOT EXISTS question_review_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  question_id TEXT NOT NULL,
  pdf_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','review','mastered')),
  error_count INTEGER NOT NULL DEFAULT 0,
  success_streak INTEGER NOT NULL DEFAULT 0,
  last_result TEXT NOT NULL DEFAULT 'wrong'
    CHECK (last_result IN ('correct','wrong')),
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conquistas
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Missões diárias
CREATE TABLE IF NOT EXISTS daily_missions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  target_questions INTEGER NOT NULL DEFAULT 5,
  answered_questions INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coins_reward INTEGER NOT NULL DEFAULT 0
);

-- Tentativas de simulado
CREATE TABLE IF NOT EXISTS simulado_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  subject TEXT,
  finished_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Storage: crie o bucket "pdfs" no painel Storage do Supabase
-- e marque como PUBLIC para que os PDFs tenham URL pública.
-- ============================================================
