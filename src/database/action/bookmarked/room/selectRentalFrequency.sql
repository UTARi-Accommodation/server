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
        room
      FROM
        room_bookmarked
      WHERE
        utari_user = :userId !
    ) room_bookmarked
    JOIN (
      SELECT
        id,
        rental
      FROM
        room
      WHERE
        available = TRUE
    ) room ON room_bookmarked.room = room.id
  )
GROUP BY
  rental
ORDER BY
  rental;