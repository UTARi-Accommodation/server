/*
 @name SelectGeneralUnitQuery
 */
SELECT
  unit_id AS "unitId",
  unit_address AS address,
  unit_latitude AS latitude,
  unit_longitude AS longitude,
  unit_facilities AS facilities,
  unit_year AS YEAR,
  unit_month :: MONTH AS MONTH,
  unit_bedrooms AS "bedRooms",
  unit_bathrooms AS "bathRooms",
  unit_rental AS rental,
  unit_ratings AS ratings,
  unit_utari_user AS "utariUser"
FROM
  filter_general_unit(
    :region !,
    :unitType !,
    :bedRooms !,
    :bathRooms !,
    :search,
    :minRental,
    :maxRental,
    :userId
  ) unit
ORDER BY
  unit.unit_score DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;