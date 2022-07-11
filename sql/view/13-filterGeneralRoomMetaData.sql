CREATE OR REPLACE VIEW filter_general_room_meta_data AS
SELECT
  *
FROM
  (
    get_accommodation_region_and_id accommodation
    JOIN (
      SELECT
        id AS rid,
        accommodation,
        room_type,
        rental
      FROM
        room
      WHERE
        available = TRUE
    ) room ON accommodation.id = room.accommodation
  );