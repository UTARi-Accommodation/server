/* @name SoftDelete */
UPDATE
  utari_user
SET
  time_deleted = :timeDeleted !
WHERE
  id = :id ! RETURNING id,
  time_deleted;