/* @name DetailedUnitQueryWithUser */
SELECT
  unit_id,
  name,
  handler_type,
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
                      id = :id !
                      AND available = true
                  ) unit
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
                      available = true
                  ) accommodation ON unit.accommodation = accommodation.accommodation_id
                )
                LEFT OUTER JOIN (
                  SELECT
                    unit,
                    utari_user
                  FROM
                    unit_bookmarked
                  WHERE
                    utari_user = :userId !
                    AND unit = :id !
                ) unit_bookmarked ON unit_bookmarked.unit = unit.unit_id
              )
              LEFT OUTER JOIN (
                SELECT
                  unit,
                  rating
                FROM
                  unit_rating
                WHERE
                  utari_user = :userId !
                  AND unit = :id !
                ORDER BY
                  id DESC
                LIMIT
                  1
              ) unit_rating ON unit_rating.unit = unit.unit_id
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
  );