/*
 @name DownloadBookmarkedUnitQuery
 @param bedRooms -> (...)
 @param bathRooms -> (...)
 @param unitTypes -> (...)
 @param regions -> (...)
 */
SELECT
  "unitId",
  "mobileNumber",
  email,
  address,
  facilities,
  remark,
  year,
  month,
  "bedRooms",
  "bathRooms",
  rental,
  rating,
  ratings,
  "timeCreated",
  name,
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
                  (
                    SELECT
                      unit,
                      utari_user,
                      time_created AS "timeCreated"
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
                    id AS "unitId",
                    accommodation,
                    bath_rooms AS "bathRooms",
                    bed_rooms AS "bedRooms",
                    rental,
                    unit_type
                  FROM
                    unit
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
                    AND (bed_rooms IN :bedRooms)
                    AND (bath_rooms IN :bathRooms)
                    AND (unit_type IN :unitTypes)
                ) unit ON unit_bookmarked.unit = unit."unitId"
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
              ) accommodation ON accommodation.accommodation_id = unit.accommodation
            )
            JOIN (
              SELECT
                id,
                name,
                handler_type AS "handlerType"
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
            ) AS "mobileNumber"
          FROM
            mobile_number
          GROUP BY
            handler
        ) mobile_number ON handler.id = mobile_number.handler
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
      ) unit_ratings ON unit."unitId" = unit_ratings.unit
    )
  )
ORDER BY
  unit_bookmarked."timeCreated" DESC;