CREATE OR REPLACE VIEW get_room_visit AS
SELECT
  room,
  COUNT(DISTINCT(room, visitor)) "visitCount"
FROM
  room_visit
GROUP BY
  room;