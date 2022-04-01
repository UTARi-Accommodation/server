/*
 @name SelectBookmarkedUnitQuery
 @param bedRooms -> (...)
 @param bathRooms -> (...)
 @param unitTypes -> (...)
 @param regions -> (...)
 */
SELECT
  unit_id,
  address,
  latitude,
  longitude,
  facilities,
  year,
  month,
  bed_rooms,
  bath_rooms,
  rental,
  ratings,
  utari_user,
  time_created
FROM
  (
    (
      (
        (
          SELECT
            unit,
            utari_user,
            time_created
          FROM
            unit_bookmarked
          WHERE
            utari_user = :userId !
        ) unit_bookmarked
        JOIN (
          SELECT
            id AS unit_id,
            accommodation,
            bath_rooms,
            bed_rooms,
            rental,
            unit_type
          FROM
            unit
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
            AND (bed_rooms IN :bedRooms)
            AND (bath_rooms IN :bathRooms)
            AND (unit_type IN :unitTypes)
        ) unit ON unit_bookmarked.unit = unit.unit_id
      )
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
          AND (region IN :regions)
          AND (
            :search :: TEXT IS NULL
            OR (
              strict_word_similarity(:search :: TEXT, address) >= 0.1
              OR strict_word_similarity(:search :: TEXT, remark) >= 0.1
              OR strict_word_similarity(:search :: TEXT, facilities) >= 0.1
            )
          )
      ) accommodation ON accommodation.accommodation_id = unit.accommodation
    )
    LEFT OUTER JOIN (
      SELECT
        unit,
        ARRAY_AGG(
          rating
          ORDER BY
            rating ASC
        ) ratings
      FROM
        (
          SELECT
            DISTINCT ON (unit, utari_user) unit,
            rating
          FROM
            unit_rating
          GROUP BY
            unit,
            utari_user,
            id
          ORDER BY
            unit,
            utari_user,
            id DESC
        ) latest_ratings
      GROUP BY
        unit
    ) unit_ratings ON unit.unit_id = unit_ratings.unit
  )
ORDER BY
  unit_bookmarked.time_created DESC
LIMIT
  :maxItemsPerPage ! OFFSET (:currentPage ! - 1) * :maxItemsPerPage !;