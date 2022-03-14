/*
 @name DownloadBookmarkedUnitQuery
 @param bedRooms -> (...)
 @param bathRooms -> (...)
 @param unitTypes -> (...)
 @param regions -> (...)
 */
SELECT
  unit_id,
  mobile_number,
  email,
  address,
  facilities,
  remark,
  year,
  month,
  bed_rooms,
  bath_rooms,
  rental,
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
                      unit,
                      utari_user,
                      time_created
                    FROM
                      unit_bookmarked
                    WHERE
                      utari_user = :userId !
                  ) unit_bookmarked
                  LEFT OUTER JOIN (
                    SELECT
                      unit,
                      rating
                    FROM
                      (
                        SELECT
                          DISTINCT ON (unit, utari_user) unit,
                          rating
                        FROM
                          unit_rating
                        WHERE
                          utari_user = :userId !
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
                      unit,
                      rating
                  ) unit_rating ON unit_rating.unit = unit_bookmarked.unit
                )
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
                    available = true
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
              ARRAY_AGG(email) email
            FROM
              email
            GROUP BY
              handler
          ) email ON handler.id = email.handler
        )
        LEFT OUTER JOIN (
          SELECT
            handler,
            ARRAY_AGG(mobile_number) mobile_number
          FROM
            mobile_number
          GROUP BY
            handler
        ) mobile_number ON handler.id = mobile_number.handler
      )
      LEFT OUTER JOIN (
        SELECT
          unit,
          ARRAY_AGG(rating) ratings
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
  )
ORDER BY
  unit_bookmarked.time_created DESC;