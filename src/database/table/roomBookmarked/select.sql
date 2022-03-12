/*
 @name Select
 */
SELECT
  COUNT (*)
FROM
  room_bookmarked
WHERE
  utari_user = :user !
  AND room = :room !;