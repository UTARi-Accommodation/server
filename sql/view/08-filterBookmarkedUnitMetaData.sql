CREATE OR REPLACE VIEW filter_bookmarked_unit_meta_data AS
SELECT
  *
FROM
  (
    (
      SELECT
        unit,
        utari_user
      FROM
        unit_bookmarked
    ) unit_bookmarked
    JOIN (
      SELECT
        id,
        rental,
        bath_rooms,
        bed_rooms
      FROM
        unit
      WHERE
        available = TRUE
    ) unit ON unit_bookmarked.unit = unit.id
  );