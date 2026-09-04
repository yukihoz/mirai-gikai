-- 報告資料の検索。
--
-- PostgREST の `or` は結合先テーブルの列を参照できないため、
-- 「記事タイトル・要約・区の正式名称のどれかに含まれる」という条件を
-- クエリビルダーでは書けない。絞り込み・並び替え・ページングをまとめて
-- DB側で行う。
--
-- 総数は window 関数で各行に付ける。件数用にもう一度同じ条件で
-- 数えると、条件を2か所に書くことになり食い違いの元になる。
create or replace function search_chuo_bills(
  p_difficulty text,
  p_query text,
  p_tag_id uuid,
  p_ascending boolean,
  p_offset integer,
  p_limit integer
)
returns table (bill_id uuid, total_count bigint)
language sql
stable
as $$
  with matched as (
    select
      b.id,
      b.submitted_date,
      count(*) over () as total
    from bills b
    join bill_contents c
      on c.bill_id = b.id
     and c.difficulty_level = p_difficulty::difficulty_level_enum
    where b.publish_status = 'published'
      and (
        p_tag_id is null
        or exists (
          select 1 from bills_tags bt
          where bt.bill_id = b.id and bt.tag_id = p_tag_id
        )
      )
      and (
        p_query = ''
        or b.name ilike '%' || p_query || '%'
        or c.title ilike '%' || p_query || '%'
        or c.summary ilike '%' || p_query || '%'
      )
  )
  select id, total
  from matched
  -- 提出日が無い記事は末尾へ。昇順・降順のどちらでも最後に置く
  order by
    (submitted_date is null),
    case when p_ascending then submitted_date end asc,
    case when not p_ascending then submitted_date end desc
  offset p_offset
  limit p_limit;
$$;

comment on function search_chuo_bills is
  '公開中の報告資料を、キーワード・カテゴリで絞り込んで返す。総数を各行に付ける';
