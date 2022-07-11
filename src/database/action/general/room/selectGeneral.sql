/*
 @name SelectGeneralRoomQuery
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
  room_utari_user AS "utariUser"
FROM
  filter_general_room(
    :region !,
    :roomType !,
    :capacities !,
    :search,
    :minRental,
    :maxRental,
    :userId
  ) room
ORDER BY
  room.room_score DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;