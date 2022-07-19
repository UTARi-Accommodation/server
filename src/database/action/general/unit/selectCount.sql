/*
 @name SelectCountGeneralUnitQuery
 */
SELECT
  COUNT(unit_id) :: INT COUNT
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
  );

