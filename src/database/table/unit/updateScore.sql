/*
 @name UpdateScore
 */
UPDATE
  unit
SET
  score = :score !
WHERE
  id = :id ! RETURNING id;