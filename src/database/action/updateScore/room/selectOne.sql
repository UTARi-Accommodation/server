/* @name QueryToUpdateScoreOfOneRoom */
SELECT
  *
FROM
  get_rooms_to_update_score
WHERE
  "roomId" = :id !;