/* @name QueryToUpdateScoreOfOneUnit */
SELECT
  *
FROM
  get_units_to_update_score
WHERE
  "unitId" = :id !;