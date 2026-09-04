-- 同じモードの取り込みが二重に走らないようにする。
--
-- 一度、前の実行が生きているのにプロセス一覧から見落として二重に起動し、
-- 同じ資料の記事を2回生成してAIの費用を二重に払ったことがある。
-- 「走っているか」の判断をプロセス一覧ではなくDBに置く。
create unique index if not exists chuo_ingestion_runs_single_running
  on chuo_ingestion_runs (mode)
  where status = 'running';

comment on index chuo_ingestion_runs_single_running is
  '1つのモードで同時に走れる実行は1つだけ';
