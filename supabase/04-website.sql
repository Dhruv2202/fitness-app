-- Adds the business's own website to a place.
-- Safe to run more than once, and safe to run while the app is live: an
-- existing row simply gets a null website until you fill one in.

alter table places add column if not exists website text;

-- The photo importer looks for places that have a website but no photo yet,
-- so give that lookup an index to work with.
create index if not exists places_website_needs_photo
  on places (id)
  where website is not null and photo_url is null;
