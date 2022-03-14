/*
 @name Upsert
 @param params -> (
 id!,
 handler!,
 address!,
 latitude!,
 longitude!,
 remark!,
 month!,
 year!,
 region!,
 facilities!,
 accommodationType!,
 available!
 )
 */
INSERT INTO
  accommodation (
    id,
    handler,
    address,
    latitude,
    longitude,
    remark,
    month,
    year,
    region,
    facilities,
    accommodation_type,
    available
  )
VALUES
  :params ON CONFLICT (id) DO
UPDATE
SET
  handler = :handler !,
  remark = :remark !,
  month = :month !,
  year = :year !,
  region = :region !,
  facilities = :facilities !,
  accommodation_type = :accommodationType !,
  available = true RETURNING id;
