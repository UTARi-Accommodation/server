/* @name Insert 
 @param params -> (unit!, user!, timeCreated!)
 */
INSERT INTO
  unit_bookmarked (unit, utari_user, time_created)
VALUES
  :params ON CONFLICT(unit, utari_user) DO NOTHING RETURNING unit,
  utari_user as "utariUser";