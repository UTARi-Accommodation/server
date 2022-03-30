/*
 @name UpdateScore
 */
UPDATE
  room
SET
  score = :score !
WHERE
  id = :id ! RETURNING id;