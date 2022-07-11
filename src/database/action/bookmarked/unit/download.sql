/*
 @name DownloadBookmarkedUnitQuery
 @param regions -> (...)
 */
SELECT
  unitId AS "unitId",
  "mobileNumber",
  email,
  address,
  facilities,
  remark,
  YEAR,
  MONTH,
  unitBedRooms AS "bedRooms",
  unitBathRooms AS "bathRooms",
  unitRental AS rental,
  rating,
  ratings,
  timeCreated AS "timeCreated",
  NAME,
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
                  filter_bookmarked_unit_by_a_user(:userId !) unit_bookmarked
                  LEFT OUTER JOIN (
                    SELECT
                      unit,
                      rating
                    FROM
                      (
                        SELECT
                          unit,
                          rating
                        FROM
                          filter_distinct_unit_rating
                        WHERE
                          utari_user = :userId !
                      ) latest_ratings
                    GROUP BY
                      unit,
                      rating
                  ) unit_rating ON unit_rating.unit = unit_bookmarked.id
                )
                JOIN filter_unit(
                  :unitTypes !,
                  :bedRooms !,
                  :bathRooms !,
                  :minRental,
                  :maxRental
                ) unit ON unit_bookmarked.id = unit.unitId
              )
              JOIN (
                SELECT
                  id AS accommodation_id,
                  HANDLER,
                  address,
                  remark,
                  MONTH,
                  YEAR,
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
              ) accommodation ON accommodation.accommodation_id = unit.unitAccommodation
            )
            JOIN (
              SELECT
                id,
                NAME,
                handler_type AS "handlerType"
              FROM
                HANDLER
            ) HANDLER ON HANDLER.id = accommodation.handler
          )
          LEFT OUTER JOIN (
            SELECT
              HANDLER,
              ARRAY_AGG(
                email
                ORDER BY
                  email ASC
              ) email
            FROM
              email
            GROUP BY
              HANDLER
          ) email ON HANDLER.id = email.handler
        )
        LEFT OUTER JOIN (
          SELECT
            HANDLER,
            ARRAY_AGG(
              mobile_number
              ORDER BY
                mobile_number ASC
            ) AS "mobileNumber"
          FROM
            mobile_number
          GROUP BY
            HANDLER
        ) mobile_number ON HANDLER.id = mobile_number.handler
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
          filter_distinct_unit_rating
        GROUP BY
          unit
      ) unit_ratings ON unit.unitId = unit_ratings.unit
    )
  )
ORDER BY
  unit_bookmarked.timeCreated DESC;