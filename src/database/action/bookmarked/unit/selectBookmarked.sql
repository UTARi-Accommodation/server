/*
 @name SelectBookmarkedUnitQuery
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
  unit_utari_user AS "utariUser",
  unit_timecreated AS "timeCreated"
FROM
  filter_bookmarked_unit(
    :userId !,
    :bedRooms !,
    :bathRooms !,
    :unitTypes !,
    :regions !,
    :search,
    :minRental,
    :maxRental
  ) unit_bookmarked
ORDER BY
  unit_bookmarked.unit_timecreated DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;