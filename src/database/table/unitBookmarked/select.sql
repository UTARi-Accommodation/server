/* @name Select */
SELECT
  COUNT (*)
FROM
  unit_bookmarked
WHERE
  utari_user = :user !
  AND unit = :unit !;