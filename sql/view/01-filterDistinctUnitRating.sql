CREATE
OR REPLACE VIEW filter_distinct_unit_rating AS
SELECT
  DISTINCT ON (unit, utari_user) unit,
  rating,
  utari_user
FROM
  unit_rating
GROUP BY
  unit,
  utari_user,
  id
ORDER BY
  unit,
  utari_user,
  id DESC;