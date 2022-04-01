/*
 @name SelectBookmarkedRoomQuery
 @param roomTypes -> (...)
 @param regions -> (...)
 @param capacities -> (...)
 */
SELECT
  room_id,
  address,
  latitude,
  longitude,
  facilities,
  year,
  month,
  room_size,
  rental,
  capacities,
  ratings,
  utari_user,
  time_created
FROM
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
                OR rental >= :minRental :: NUMERIC(10, 2)
              )
              AND (
                :maxRental :: NUMERIC(10, 2) IS NULL
                OR rental <= :maxRental :: NUMERIC(10, 2)
              )
              AND (room_type IN :roomTypes)
          ) room ON room_bookmarked.room = room.room_id
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
                strict_word_similarity(:search :: TEXT, address) >= 0.1
                OR strict_word_similarity(:search :: TEXT, remark) >= 0.1
                OR strict_word_similarity(:search :: TEXT, facilities) >= 0.1
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
  room_bookmarked.time_created DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;