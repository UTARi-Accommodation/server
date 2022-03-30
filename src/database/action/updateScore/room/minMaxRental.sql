/* @name SelectMinMaxRental */
SELECT
  MIN(rental),
  MAX(rental)
FROM
  room
WHERE
  available = TRUE;