/* @name DetailedRoomQuery */
SELECT
  "roomId",
  "handlerType",
  name,
  "mobileNumber",
  email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  year,
  month,
  "roomSize",
  rental,
  capacities,
  "visitCount",
  ratings
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
                    id AS "roomId",
                    accommodation,
                    rental,
                    room_size AS "roomSize"
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
              JOIN (
                SELECT
                  id,
                  handler_type AS "handlerType",
                  name
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
            ) email ON accommodation.handler = email.handler
          )
          LEFT OUTER JOIN (
            SELECT
              handler,
              ARRAY_AGG(
                mobile_number
                ORDER BY
                  mobile_number ASC
              ) AS "mobileNumber"
            FROM
              mobile_number
            GROUP BY
              handler
          ) mobile_number ON accommodation.handler = mobile_number.handler
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
          GROUP BY
            room
        ) room_capacity ON room."roomId" = room_capacity.room
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
        COUNT(DISTINCT(room, visitor)) AS "visitCount"
      FROM
        room_visit
      GROUP BY
        room
    ) room_visit ON room."roomId" = room_visit.room
  );