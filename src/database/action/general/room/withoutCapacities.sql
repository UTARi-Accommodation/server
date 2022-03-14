/* @name GeneralRoomQueryWithoutCapacities */
SELECT
  room_id,
  mobile_number,
  email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  year,
  month,
  room_size,
  rental,
  capacities,
  ratings,
  visit_count,
  utari_user
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
                    remark,
                    month,
                    year,
                    region,
                    facilities,
                    accommodation_type
                  FROM
                    accommodation
                  WHERE
                    available = true
                    AND region = :region !
                    AND (
                      :search :: TEXT IS NULL
                      OR (
                        strict_word_similarity(:search :: TEXT, address) >= 0.1
                        OR strict_word_similarity(:search :: TEXT, remark) >= 0.1
                        OR strict_word_similarity(:search :: TEXT, facilities) >= 0.1
                      )
                    )
                ) accommodation
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
                    available = true
                    AND (
                      :minRental :: NUMERIC(10, 2) IS NULL
                      OR rental >= :minRental :: NUMERIC(10, 2)
                    )
                    AND (
                      :maxRental :: NUMERIC(10, 2) IS NULL
                      OR rental <= :maxRental :: NUMERIC(10, 2)
                    )
                    AND room_type = :roomType !
                ) room ON accommodation.accommodation_id = room.accommodation
              )
              LEFT OUTER JOIN (
                SELECT
                  room,
                  utari_user
                FROM
                  room_bookmarked
                WHERE
                  (
                    :userId :: TEXT IS NULL
                    OR utari_user = :userId :: TEXT
                  )
              ) room_bookmarked ON room_bookmarked.room = room.room_id
            )
            LEFT OUTER JOIN (
              SELECT
                handler,
                ARRAY_AGG(email) email
              FROM
                email
              GROUP BY
                handler
            ) email ON accommodation.handler = email.handler
          )
          LEFT OUTER JOIN (
            SELECT
              handler,
              ARRAY_AGG(mobile_number) mobile_number
            FROM
              mobile_number
            GROUP BY
              handler
          ) mobile_number ON accommodation.handler = mobile_number.handler
        )
        LEFT OUTER JOIN (
          SELECT
            room,
            ARRAY_AGG(rating) ratings
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
      LEFT OUTER JOIN (
        SELECT
          room,
          COUNT(DISTINCT(room, visitor)) AS visit_count
        FROM
          room_visit
        GROUP BY
          room
      ) room_visit ON room.room_id = room_visit.room
    )
    JOIN (
      SELECT
        room,
        ARRAY_AGG(capacities) capacities
      FROM
        room_capacity
      GROUP BY
        room
    ) room_capacity ON room.room_id = room_capacity.room
  )
ORDER BY
  room.room_id;
