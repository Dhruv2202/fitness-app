-- The photo fetcher always took the first few places by id, so a site that
-- blocks us stayed at the front of the queue forever and nothing after it was
-- ever tried. Recording an attempt lets failures move to the back.
-- Safe to run more than once.

alter table places add column if not exists photo_attempted_at timestamptz;

drop index if exists places_website_needs_photo;

create index if not exists places_photo_queue
  on places (photo_attempted_at nulls first, id)
  where website is not null and photo_url is null;
