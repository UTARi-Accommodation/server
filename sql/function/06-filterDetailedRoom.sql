CREATE OR REPLACE FUNCTION filter_detailed_room (roomId INT) RETURNS TABLE (
  email_handler TEXT,
  mobile_number_handler TEXT,
  handler_mobile_number TEXT [ ],
  handler_email TEXT [ ],
  room_capacities INTEGER [ ],
  room_visit_count BIGINT,
  room_ratings INT [ ]
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  handler,
  mn_handler,
  "mobileNumbers",
  emails,
  aggregation,
  "visitCount",
  ratings
FROM
  (
    (
      (
        aggregate_handler_contact
        JOIN aggregate_room_capacity()
          roomCapacity ON roomId = roomCapacity.id
      )
      LEFT OUTER JOIN aggregate_room_rating
        room_ratings ON roomId = room_ratings.room
    )
    LEFT OUTER JOIN get_room_visit
      room_visit ON roomId = room_visit.room
  );
END;
$$
