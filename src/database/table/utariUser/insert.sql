/* @name Insert
 @param params -> (id!, timeCreated!)
 */
INSERT INTO
  utari_user (id, time_created)
VALUES
  :params ON CONFLICT (id) DO NOTHING RETURNING id;