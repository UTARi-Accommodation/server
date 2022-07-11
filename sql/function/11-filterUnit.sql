CREATE OR REPLACE FUNCTION filter_unit (
  unitTypes_queried TEXT [ ],
  bedRooms_queried INTEGER [ ],
  bathRooms_queried INTEGER [ ],
  minRental NUMERIC(10, 2) DEFAULT NULL,
  maxRental NUMERIC(10, 2) DEFAULT NULL
) RETURNS TABLE (
  unitId INTEGER,
  unitAccommodation INTEGER,
  unitBathRooms INTEGER,
  unitBedRooms INTEGER,
  unitRental NUMERIC(10, 2),
  unitScore DOUBLE PRECISION
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  id,
  accommodation,
  bath_rooms,
  bed_rooms,
  rental,
  score
FROM
  unit
WHERE
  available = TRUE
  AND (
    minRental IS NULL
    OR rental >= minRental
  )
  AND (
    maxRental IS NULL
    OR rental <= maxRental
  )
  AND bed_rooms = ANY(bedRooms_queried)
  AND bath_rooms = ANY(bathRooms_queried)
  AND unit_type = ANY(unitTypes_queried :: UnitType [ ]);
END;
$$