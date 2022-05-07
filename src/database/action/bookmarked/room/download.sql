/*
 @name DownloadBookmarkedRoomQuery
 @param roomTypes -> (...)
 @param regions -> (...)
 @param capacities -> (...)
 */
SELECT
  room_id,
  mobile_number,
  email,
  address,
  facilities,
  remark,
  year,
  month,
  room_size,
  rental,
  capacities,
  rating,
  ratings,
  time_created,
  name,
  handler_type
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  (
                    SELECT
                      room,
                      utari_user,
                      time_created
                    FROM
                      room_bookmarked
                    WHERE
                      utari_user = :userId !
                  ) room_bookmarked
                  LEFT OUTER JOIN (
                    SELECT
                      room,
                      rating
                    FROM
                      (
                        SELECT
                          DISTINCT ON (room, utari_user) room,
                          rating
                        FROM
                          room_rating
                        WHERE
                          utari_user = :userId !
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
                      room,
                      rating
                  ) room_rating ON room_rating.room = room_bookmarked.room
                )
                JOIN (
                  SELECT
                    id AS room_id,
                    accommodation,
                    rental,
                    room_size,
                    room_type
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
                    AND (room_type IN :roomTypes)
                ) room ON room_bookmarked.room = room.room_id
              )
              JOIN (
                SELECT
                  id AS accommodation_id,
                  handler,
                  address,
                  remark,
                  month,
                  year,
                  region,
                  facilities,
                  accommodation_type
                FROM
                  accommodation
                WHERE
                  available = TRUE
                  AND (region IN :regions)
                  AND (
                    :search :: TEXT IS NULL
                    OR (
                      strict_word_similarity(:search, address) >= 0.1
                      OR strict_word_similarity(:search, remark) >= 0.1
                      OR strict_word_similarity(:search, facilities) >= 0.1
                    )
                  )
              ) accommodation ON accommodation.accommodation_id = room.accommodation
            )
            JOIN (
              SELECT
                id,
                name,
                handler_type
              FROM
                handler
            ) handler ON handler.id = accommodation.handler
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
          ) email ON handler.id = email.handler
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
        ) mobile_number ON handler.id = mobile_number.handler
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
      ) room_ratings ON room.room_id = room_ratings.room
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
    ) room_capacity ON room.room_id = room_capacity.room
  )
ORDER BY
  room_bookmarked.time_created DESC;
