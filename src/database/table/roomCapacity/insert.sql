/* @name Insert
 @param params -> (room!, capacities!)
 */
INSERT INTO
  room_capacity (room, capacities)
VALUES
  :params RETURNING id;