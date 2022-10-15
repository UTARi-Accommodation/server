/* @name DetailedRoomQuery */
SELECT
  "roomId",
  "handlerType",
  NAME,
  handler_mobile_number AS "mobileNumber",
  handler_email AS email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  YEAR,
  MONTH,
  "roomSize",
  rental,
  room_capacities AS capacities,
  room_visit_count AS "visitCount",
  room_ratings AS ratings
FROM
  (
    (
      (
        SELECT
          *
        FROM
          filter_detailed_room_by_id
        WHERE
          "roomId" = :id !
      ) room
      JOIN filter_handler HANDLER ON HANDLER.id = room.handler
    ) room_handler
    LEFT OUTER JOIN (
      SELECT
        *
      FROM
        filter_detailed_room(:id !)
    ) room_meta_data ON (
      room_handler.handler = room_meta_data.email_handler
      OR room_handler.handler = room_meta_data.mobile_number_handler
    )
  );