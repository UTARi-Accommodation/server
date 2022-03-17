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
        unit
      FROM
        unit_bookmarked
      WHERE
        utari_user = :userId !
    ) unit_bookmarked
    JOIN (
      SELECT
        id,
        rental
      FROM
        unit
      WHERE
        available = TRUE
    ) unit ON unit_bookmarked.unit = unit.id
  )
GROUP BY
  rental
ORDER BY
  rental;