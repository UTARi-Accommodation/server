/* @name SelectRentalFrequency */
SELECT
  rental,
  COUNT(rental) :: INT frequency
FROM
  filter_general_room_meta_data
WHERE
  region = :region !
  AND room_type = :roomType !
GROUP BY
  rental
ORDER BY
  rental;