CREATE OR REPLACE VIEW get_unit_visit AS
SELECT
  unit,
  COUNT(DISTINCT(unit, visitor)) "visitCount"
FROM
  unit_visit
GROUP BY
  unit;