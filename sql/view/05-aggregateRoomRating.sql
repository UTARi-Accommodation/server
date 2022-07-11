CREATE OR REPLACE VIEW aggregate_room_rating AS
SELECT
  room,
  ARRAY_AGG(
    rating
    ORDER BY
      rating ASC
  ) ratings
FROM
  filter_distinct_room_rating
GROUP BY
  room;