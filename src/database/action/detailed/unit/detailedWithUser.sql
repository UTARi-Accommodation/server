/* @name DetailedUnitQueryWithUser */
SELECT
  "unitId",
  NAME,
  "handlerType",
  handler_mobile_number AS "mobileNumber",
  handler_email AS email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  YEAR,
  MONTH,
  "bedRooms",
  "bathRooms",
  rental,
  "utariUser",
  unit_visit_count AS "visitCount",
  unit_ratings AS ratings,
  rating
FROM
  (
    (
      (
        (
          (
            SELECT
              *
            FROM
              filter_detailed_unit_by_id
            WHERE
              "unitId" = :id !
          ) unit
          LEFT OUTER JOIN (
            SELECT
              unit,
              utari_user AS "utariUser"
            FROM
              unit_bookmarked
            WHERE
              utari_user = :userId !
              AND unit = :id !
          ) unit_bookmarked ON unit_bookmarked.unit = unit."unitId"
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
        ) unit_rating ON unit_rating.unit = unit."unitId"
      )
      JOIN filter_handler HANDLER ON HANDLER.id = unit.handler
    ) unit_handler
    LEFT OUTER JOIN (
      SELECT
        *
      FROM
        filter_detailed_unit(:id !)
    ) unit_meta_data ON (
      unit_handler.handler = unit_meta_data.email_handler
      OR unit_handler.handler = unit_meta_data.mobile_number_handler
    )
  );