/*
 @name SelectCountBookmarkedUnitQuery
 */
SELECT
  COUNT(unit_id)
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