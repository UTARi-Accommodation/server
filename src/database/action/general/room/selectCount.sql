/*
 @name SelectCountGeneralRoomQuery
 */
SELECT
  COUNT(room_id) :: INT COUNT
FROM
  filter_general_room(
    :region !,
    :roomType !,
    :capacities !,
    :search,
    :minRental,
    :maxRental,
    :userId
  );