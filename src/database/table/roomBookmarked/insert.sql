/* 
 @name Insert
 @param params -> (room!, user!, timeCreated!)
 */
INSERT INTO
  room_bookmarked (room, utari_user, time_created)
VALUES
  :params ON CONFLICT (room, utari_user) DO NOTHING RETURNING room,
  utari_user;