/*
 @name GeneralUnitQueryWithBathRoomsAndWithoutBedRooms
 @param bathRooms -> (...)
 */
SELECT
  unit_id,
  mobile_number,
  email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  year,
  month,
  bed_rooms,
  bath_rooms,
  rental,
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
                  AND (bath_rooms IN :bathRooms)
                  AND unit_type = :unitType !
              ) unit ON accommodation.accommodation_id = unit.accommodation
            )
            LEFT OUTER JOIN (
              SELECT
                unit,
                utari_user
              FROM
                unit_bookmarked
              WHERE
                (
                  :userId :: TEXT IS NULL
                  OR utari_user = :userId :: TEXT
                )
            ) unit_bookmarked ON unit_bookmarked.unit = unit.unit_id
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
    LEFT OUTER JOIN (
      SELECT
        unit,
        COUNT(DISTINCT(unit, visitor)) AS visit_count
      FROM
        unit_visit
      GROUP BY
        unit
    ) unit_visit ON unit.unit_id = unit_visit.unit
  )
ORDER BY
  unit.unit_id;