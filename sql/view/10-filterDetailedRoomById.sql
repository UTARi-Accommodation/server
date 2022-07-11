CREATE
OR REPLACE VIEW filter_detailed_room_by_id AS
SELECT
  *
FROM
  (
    (
      SELECT
        id AS "roomId",
        accommodation,
        rental,
        room_size AS "roomSize"
      FROM
        room
      WHERE
        available = TRUE
    ) room
    JOIN filter_available_accommodation accommodation ON room.accommodation = accommodation.accommodation_id
  );