/* @name DetailedRoomQueryWithUser */
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
  room_ratings AS ratings,
  utari_user AS "utariUser",
  rating
FROM
  (
    (
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
          LEFT OUTER JOIN (
            SELECT
              id AS room,
              utariUser AS utari_user
            FROM
              filter_bookmarked_room_by_a_user(:userId !)
            WHERE
              id = :id !
          ) room_bookmarked ON room_bookmarked.room = room."roomId"
        )
        LEFT OUTER JOIN (
          SELECT
            room,
            rating
          FROM
            room_rating
          WHERE
            utari_user = :userId !
            AND room = :id !
          ORDER BY
            id DESC
          LIMIT
            1
        ) room_rating ON room_rating.room = room."roomId"
      )
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