/* @name Insert
 @param params -> (visitor!, unit!, timeCreated!)
 */
INSERT INTO
  unit_visit (visitor, unit, time_created)
VALUES
  :params RETURNING visitor,
  unit,
  id;