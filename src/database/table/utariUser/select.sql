/* @name Select */
SELECT
  id
FROM
  utari_user
WHERE
  id = :id !
  AND time_deleted IS NULL;