/* 
 @name Insert
 @param params -> (user!, room!, rating!, timeCreated!)
 */
INSERT INTO
  room_rating (utari_user, room, rating, time_created)
VALUES
  :params RETURNING utari_user AS "utariUser",
  room;