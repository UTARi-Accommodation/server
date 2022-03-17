/* @name DetailedRoomQueryWithUser */
SELECT
  room_id,
  handler_type,
  name,
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
  utari_user,
  visit_count,
  ratings,
  rating
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
                    (
                      SELECT
                        id AS room_id,
                        accommodation,
                        rental,
                        room_size
                      FROM
                        room
                      WHERE
                        id = :id !
                        AND available = TRUE
                    ) room
                    JOIN (
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
                        available = TRUE
                    ) accommodation ON room.accommodation = accommodation.accommodation_id
                  )
                  LEFT OUTER JOIN (
                    SELECT
                      room,
                      utari_user
                    FROM
                      room_bookmarked
                    WHERE
                      utari_user = :userId !
                      AND room = :id !
                  ) room_bookmarked ON room_bookmarked.room = room.room_id
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
                ) room_rating ON room_rating.room = room.room_id
              )
              JOIN (
                SELECT
                  id,
                  handler_type,
                  name
                FROM
                  handler
              ) handler ON handler.id = accommodation.handler
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
  );