CREATE
OR REPLACE VIEW get_room_visit AS
SELECT
  room,
  COUNT(DISTINCT(room, visitor)) :: INT "visitCount"
FROM
  room_visit
GROUP BY
  room;