/* @name Insert 
 @param params -> (visitor!, room!, timeCreated!)
 */
INSERT INTO
  room_visit (visitor, room, time_created)
VALUES
  :params RETURNING visitor,
  room,
  id;