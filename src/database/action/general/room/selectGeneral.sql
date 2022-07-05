/*
 @name SelectGeneralRoomQuery
 @param capacities -> (...)
 */
SELECT
  "roomId",
  score,
  address,
  latitude,
  longitude,
  facilities,
  year,
  month,
  "roomSize",
  rental,
  capacities,
  ratings,
  "utariUser"
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  SELECT
                    id AS accommodation_id,
                    handler,
                    address,
                    latitude,
                    longitude,
                    month,
                    year,
                    region,
                    facilities,
                    accommodation_type
                  FROM
                    accommodation
                  WHERE
                    available = TRUE
                    AND region = :region !
                    AND (
                      :search :: TEXT IS NULL
                      OR (
                        strict_word_similarity(:search, address) >= 0.1
                        OR strict_word_similarity(:search, remark) >= 0.1
                        OR strict_word_similarity(:search, facilities) >= 0.1
                      )
                    )
                ) accommodation
                JOIN (
                  SELECT
                    id AS "roomId",
                    accommodation,
                    rental,
                    room_size AS "roomSize",
                    room_type,
                    score
                  FROM
                    room
                  WHERE
                    available = TRUE
                    AND (
                      :minRental :: NUMERIC(10, 2) IS NULL
                      OR rental >= :minRental
                    )
                    AND (
                      :maxRental :: NUMERIC(10, 2) IS NULL
                      OR rental <= :maxRental
                    )
                    AND room_type = :roomType !
                ) room ON accommodation.accommodation_id = room.accommodation
              )
              LEFT OUTER JOIN (
                SELECT
                  room,
                  utari_user AS "utariUser"
                FROM
                  room_bookmarked
                WHERE
                  (
                    :userId :: TEXT IS NULL
                    OR utari_user = :userId
                  )
              ) room_bookmarked ON room_bookmarked.room = room."roomId"
            )
            LEFT OUTER JOIN (
              SELECT
                handler,
                ARRAY_AGG(
                  email
                  ORDER BY
                    email ASC
                ) email
              FROM
                email
              GROUP BY
                handler
            ) email ON accommodation.handler = email.handler
          )
          LEFT OUTER JOIN (
            SELECT
              handler,
              ARRAY_AGG(
                mobile_number
                ORDER BY
                  mobile_number ASC
              ) mobile_number
            FROM
              mobile_number
            GROUP BY
              handler
          ) mobile_number ON accommodation.handler = mobile_number.handler
        )
        LEFT OUTER JOIN (
          SELECT
            room,
            ARRAY_AGG(
              rating
              ORDER BY
                rating ASC
            ) ratings
          FROM
            (
              SELECT
                DISTINCT ON (room, utari_user) room,
                rating
              FROM
                room_rating
              GROUP BY
                room,
                utari_user,
                id
              ORDER BY
                room,
                utari_user,
                id DESC
            ) latest_ratings
          GROUP BY
            room
        ) room_ratings ON room."roomId" = room_ratings.room
      )
      LEFT OUTER JOIN (
        SELECT
          room,
          COUNT(DISTINCT(room, visitor)) AS visit_count
        FROM
          room_visit
        GROUP BY
          room
      ) room_visit ON room."roomId" = room_visit.room
    )
    JOIN (
      SELECT
        room,
        ARRAY_AGG(
          capacities
          ORDER BY
            capacities ASC
        ) capacities
      FROM
        room_capacity
      WHERE
        capacities IN :capacities
      GROUP BY
        room
    ) room_capacity ON room."roomId" = room_capacity.room
  )
ORDER BY
  room.score DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;