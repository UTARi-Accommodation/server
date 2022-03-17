/*
 @name SelectBedRoomsAndBathRoomsRange
 */
SELECT
  ARRAY_AGG(DISTINCT bed_rooms) AS bed_rooms,
  ARRAY_AGG(DISTINCT bath_rooms) AS bath_rooms
FROM
  (
    (
      SELECT
        id
      FROM
        accommodation
      WHERE
        region = :region !
    ) accommodation
    JOIN (
      SELECT
        bed_rooms,
        bath_rooms,
        accommodation
      FROM
        unit
      WHERE
        available = TRUE
        AND unit_type = :unitType !
    ) unit ON accommodation.id = unit.accommodation
  );