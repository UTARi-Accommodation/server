/*
 @name SelectRentalFrequency
 */
SELECT
  rental,
  COUNT(rental) AS frequency
FROM
  (
    (
      SELECT
        id
      FROM
        accommodation
      WHERE
        region = :region !
    ) accommodation
    JOIN (
      SELECT
        rental,
        accommodation
      FROM
        unit
      WHERE
        available = true
        AND unit_type = :unitType !
    ) unit ON accommodation.id = unit.accommodation
  )
GROUP BY
  rental
ORDER BY
  rental;