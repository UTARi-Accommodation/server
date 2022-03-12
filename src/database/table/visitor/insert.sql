/*
 @name Insert
 @param params -> (id!, timeCreated!)
 */
INSERT INTO
  visitor (id, time_created)
VALUES
  :params ON CONFLICT (id) DO NOTHING RETURNING id;