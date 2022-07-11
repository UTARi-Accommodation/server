/*
 @name SelectCountGeneralRoomQuery
 */
SELECT
  COUNT(room_id)
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