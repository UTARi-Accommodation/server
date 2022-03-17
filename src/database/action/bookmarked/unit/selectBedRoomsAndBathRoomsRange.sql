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
        unit
      FROM
        unit_bookmarked
      WHERE
        utari_user = :userId !
    ) unit_bookmarked
    JOIN (
      SELECT
        bed_rooms,
        bath_rooms,
        id
      FROM
        unit
      WHERE
        available = TRUE
    ) unit ON unit_bookmarked.unit = unit.id
  );