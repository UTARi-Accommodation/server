/* @name DetailedUnitQuery */
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
  unit_visit_count AS "visitCount",
  unit_ratings AS ratings
FROM
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
