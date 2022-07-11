CREATE
OR REPLACE VIEW filter_general_unit_meta_data AS
SELECT
  *
FROM
  (
    get_accommodation_region_and_id accommodation
    JOIN (
      SELECT
        bed_rooms,
        bath_rooms,
        accommodation,
        unit_type,
        rental
      FROM
        unit
      WHERE
        available = TRUE
    ) unit ON accommodation.id = unit.accommodation
  );