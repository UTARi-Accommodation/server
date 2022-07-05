/*
 @name SelectBookmarkedRoomQuery
 @param roomTypes -> (...)
 @param regions -> (...)
 @param capacities -> (...)
 */
SELECT
  "roomId",
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
  "utariUser",
  "timeCreated"
FROM
  (
    (
      (
        (
          (
            SELECT
              room,
              utari_user AS "utariUser",
              time_created AS "timeCreated"
            FROM
              room_bookmarked
            WHERE
              utari_user = :userId !
          ) room_bookmarked
          JOIN (
            SELECT
              id AS "roomId",
              accommodation,
              rental,
              room_size AS "roomSize",
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
          ) room ON room_bookmarked.room = room."roomId"
        )
        JOIN (
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
  room_bookmarked."timeCreated" DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;