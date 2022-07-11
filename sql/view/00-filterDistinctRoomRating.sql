CREATE OR REPLACE VIEW filter_distinct_room_rating AS
SELECT
  DISTINCT ON (room, utari_user) room,
  rating,
  utari_user
FROM
  room_rating
GROUP BY
  room,
  utari_user,
  id
ORDER BY
  room,
  utari_user,
  id DESC;