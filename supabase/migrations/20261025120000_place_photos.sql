-- Freely licensed park photos (Wikimedia Commons). The resized files ship with the app
-- under public/images/parks/{640,1280}/<id>.webp; the catalog keeps the file name and
-- attribution so every display can credit the author. Values come from the catalog CSV seed.
alter table public.places
  add column image_path text check (image_path ~ '^[a-z0-9-]+[.]webp$'),
  add column image_author text check (image_author is null or btrim(image_author) <> ''),
  add column image_license text check (image_license is null or btrim(image_license) <> ''),
  add column image_license_url text check (image_license_url is null or image_license_url ~ '^https://'),
  add column image_source_url text check (image_source_url is null or image_source_url ~ '^https://'),
  add constraint places_image_attribution check (
    image_path is null or (image_author is not null and image_license is not null and image_source_url is not null)
  );
