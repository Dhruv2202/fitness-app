-- Several photos per place, shown as a slideshow on the card.
-- photo_url stays as the cover image: the list query reads it, and keeping it
-- means nothing that already works has to change at once.
-- Safe to run more than once.

alter table places add column if not exists photos text[] not null default '{}';

-- Carry the existing single photo into the array so nothing is lost.
update places
set photos = array[photo_url]
where photo_url is not null
  and photo_url <> ''
  and cardinality(photos) = 0;
