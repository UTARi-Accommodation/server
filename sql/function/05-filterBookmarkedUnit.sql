CREATE
OR REPLACE FUNCTION filter_bookmarked_unit (
  userId TEXT,
  bedRooms_queried INTEGER [ ],
  bathRooms_queried INTEGER [ ],
  unitTypes_queried TEXT [ ],
  regions TEXT [ ],
  SEARCH TEXT DEFAULT NULL,
  minRental NUMERIC(10, 2) DEFAULT NULL,
  maxRental NUMERIC(10, 2) DEFAULT NULL
) RETURNS TABLE (
  unit_id INTEGER,
  unit_address TEXT,
  unit_latitude DOUBLE PRECISION,
  unit_longitude DOUBLE PRECISION,
  unit_facilities TEXT,
  unit_YEAR INTEGER,
  unit_MONTH TEXT,
  unit_bedrooms INTEGER,
  unit_bathrooms INTEGER,
  unit_rental NUMERIC(10, 2),
  unit_ratings INTEGER [ ],
  unit_utari_user TEXT,
  unit_timecreated TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  unitId,
  accommodation_address,
  accommodation_latitude,
  accommodation_longitude,
  accommodation_facilities,
  accommodation_YEAR,
  accommodation_MONTH,
  unitBedRooms,
  unitBathRooms,
  unitRental,
  ratings,
  utariUser,
  timeCreated
FROM
  (
    (
      (
        filter_bookmarked_unit_by_a_user(userId)
          unit_bookmarked
        JOIN filter_unit(
          unitTypes_queried,
          bedRooms_queried,
          bathRooms_queried,
          minRental,
          maxRental
        )
          unit ON unit_bookmarked.id = unit.unitId
      )
      JOIN filter_accommodation(regions, SEARCH) accommodation ON accommodation.accommodation_id = unit.unitAccommodation
    )
    LEFT OUTER JOIN aggregate_unit_rating
      unit_ratings ON unit.unitId = unit_ratings.unit
  );
END;
$$