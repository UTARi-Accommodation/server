CREATE OR REPLACE VIEW filter_bookmarked_room_meta_data AS
SELECT
  *
FROM
  (
    (
      SELECT
        id AS room,
        utariUser AS utari_user
      FROM
        filter_bookmarked_room_by_a_user(NULL)
    ) room_bookmarked
    JOIN (
      SELECT
        id,
        rental
      FROM
        room
      WHERE
        available = TRUE
    ) room ON room_bookmarked.room = room.id
  );