/* @name SelectRentalFrequency */
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
        room
      WHERE
        available = true
        AND room_type = :roomType !
    ) room ON accommodation.id = room.accommodation
  )
GROUP BY
  rental
ORDER BY
  rental;