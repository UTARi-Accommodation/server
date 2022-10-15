/*
 @name SelectCountBookmarkedUnitQuery
 */
SELECT
  COUNT(unit_id) :: INT COUNT
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
  );