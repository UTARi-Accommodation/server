CREATE OR REPLACE VIEW aggregate_unit_rating AS
SELECT
  unit,
  ARRAY_AGG(
    rating
    ORDER BY
      rating ASC
  ) ratings
FROM
  filter_distinct_unit_rating
GROUP BY
  unit;