/* @name Insert 
 @param params -> (user!, unit!, rating!, timeCreated!)
 */
INSERT INTO
  unit_rating (utari_user, unit, rating, time_created)
VALUES
  :params RETURNING utari_user,
  unit;