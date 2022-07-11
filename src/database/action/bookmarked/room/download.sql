/*
 @name DownloadBookmarkedRoomQuery
 */
SELECT
  roomId AS "roomId",
  "mobileNumbers" AS "mobileNumber",
  emails AS email,
  accommodation_address AS address,
  accommodation_facilities AS facilities,
  accommodation_remark AS remark,
  accommodation_YEAR AS YEAR,
  accommodation_MONTH :: MONTH AS MONTH,
  size :: RoomSize AS "roomSize",
  roomRental AS rental,
  aggregation AS capacities,
  rating,
  ratings,
  timeCreated AS "timeCreated",
  NAME,
  "handlerType"
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  filter_bookmarked_room_by_a_user(:userId !) room_bookmarked
                  LEFT OUTER JOIN (
                    SELECT
                      room,
                      rating
                    FROM
                      filter_distinct_room_rating
                    WHERE
                      utari_user = :userId !
                    GROUP BY
                      room,
                      rating
                  ) room_rating ON room_rating.room = room_bookmarked.id
                )
                JOIN filter_room(:roomTypes !, :minRental, :maxRental) room ON room_bookmarked.id = room.roomId
              )
              JOIN filter_accommodation(:regions !, :search) accommodation ON accommodation.accommodation_id = room.roomAccommodation
            )
            JOIN filter_handler HANDLER ON HANDLER.id = accommodation.accommodation_handler
          )
          LEFT OUTER JOIN aggregate_handler_email email ON HANDLER.id = email.handler
        )
        LEFT OUTER JOIN aggregate_handler_mobile_number mobile_number ON HANDLER.id = mobile_number.mn_handler
      )
      LEFT OUTER JOIN aggregate_room_rating room_ratings ON room.roomId = room_ratings.room
    )
    JOIN aggregate_room_capacity(:capacities !) room_capacity ON room.roomId = room_capacity.id
  )
ORDER BY
  room_bookmarked.timeCreated DESC;