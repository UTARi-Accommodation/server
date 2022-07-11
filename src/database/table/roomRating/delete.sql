/* @name Remove */
DELETE FROM
  room_rating
WHERE
  utari_user = :user !
  AND room = :room ! RETURNING room,
  utari_user AS "utariUser";