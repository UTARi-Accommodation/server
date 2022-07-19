/*
 @name SelectRentalFrequency
 */
SELECT
  rental,
  COUNT(rental) :: INT frequency
FROM
  filter_general_unit_meta_data
WHERE
  region = :region !
  AND unit_type = :unitType !
GROUP BY
  rental
ORDER BY
  rental;

