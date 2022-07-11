/*
 @name SelectCountBookmarkedRoomQuery
 */
SELECT
  COUNT(room_id)
FROM
  filter_bookmarked_room(
    :userId !,
    :capacities !,
    :roomTypes !,
    :regions !,
    :search,
    :minRental,
    :maxRental
  );