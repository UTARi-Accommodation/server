CREATE OR REPLACE VIEW filter_detailed_unit_by_id AS
SELECT
  *
FROM
  (
    (
      SELECT
        id AS "unitId",
        accommodation,
        bath_rooms AS "bathRooms",
        bed_rooms AS "bedRooms",
        rental
      FROM
        unit
      WHERE
        available = TRUE
    ) unit
    JOIN filter_available_accommodation accommodation ON unit.accommodation = accommodation.accommodation_id
  );