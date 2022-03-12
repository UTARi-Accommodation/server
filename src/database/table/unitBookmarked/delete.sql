/* @name Remove */
DELETE FROM
  unit_bookmarked
WHERE
  utari_user = :user !
  AND unit = :unit ! RETURNING unit,
  utari_user;