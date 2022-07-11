/*
 @name SelectBedRoomsAndBathRoomsRange
 */
SELECT
  ARRAY_AGG(
    DISTINCT bed_rooms
    ORDER BY
      bed_rooms ASC
  ) AS bed_rooms,
  ARRAY_AGG(
    DISTINCT bath_rooms
    ORDER BY
      bath_rooms ASC
  ) AS bath_rooms
FROM
  filter_general_unit_meta_data
WHERE
  region = :region !
  AND unit_type = :unitType !;