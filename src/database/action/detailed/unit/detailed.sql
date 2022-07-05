/* @name DetailedUnitQuery */
SELECT
  "unitId",
  name,
  "handlerType",
  "mobileNumber",
  email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  year,
  month,
  "bedRooms",
  "bathRooms",
  rental,
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
                  id = :id !
                  AND available = TRUE
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
                  available = TRUE
              ) accommodation ON unit.accommodation = accommodation.accommodation_id
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
    LEFT OUTER JOIN (
      SELECT
        unit,
        COUNT(DISTINCT(unit, visitor)) AS "visitCount"
      FROM
        unit_visit
      GROUP BY
        unit
    ) unit_visit ON unit."unitId" = unit_visit.unit
  );