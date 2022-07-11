CREATE
OR REPLACE VIEW filter_available_accommodation AS
SELECT
  id AS accommodation_id,
  HANDLER,
  address,
  latitude,
  longitude,
  remark,
  MONTH,
  YEAR,
  region,
  facilities,
  accommodation_type
FROM
  accommodation
WHERE
  available = TRUE