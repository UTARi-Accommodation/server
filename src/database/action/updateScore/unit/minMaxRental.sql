/* @name SelectMinMaxRental */
SELECT
  MIN(rental),
  MAX(rental)
FROM
  unit
WHERE
  available = TRUE;