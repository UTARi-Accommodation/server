/*
 @name SelectBookmarkedRoomQuery
 */
SELECT
  room_id AS "roomId",
  room_address AS address,
  room_latitude AS latitude,
  room_longitude AS longitude,
  room_facilities AS facilities,
  room_year AS YEAR,
  room_month :: MONTH AS MONTH,
  room_room_size :: RoomSize AS "roomSize",
  room_rental AS rental,
  room_capacities AS capacities,
  room_ratings AS ratings,
  room_utari_user AS "utariUser",
  room_timecreated AS "timeCreated"
FROM
  filter_bookmarked_room(
    :userId !,
    :capacities !,
    :roomTypes !,
    :regions !,
    :search,
    :minRental,
    :maxRental
  ) room_bookmarked
ORDER BY
  room_bookmarked.room_timecreated DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;