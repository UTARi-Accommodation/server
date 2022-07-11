CREATE
OR REPLACE VIEW get_units_to_update_score AS
SELECT
  "unitId",
  "mobileNumbers" AS "mobileNumber",
  emails AS email,
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
  ratings,
  "visitCount"
FROM
  (
    (
      (
        (
          filter_detailed_unit_by_id unit
          LEFT OUTER JOIN aggregate_handler_email email ON unit.handler = email.handler
        )
        LEFT OUTER JOIN aggregate_handler_mobile_number mobile_number ON unit.handler = mobile_number.mn_handler
      )
      LEFT OUTER JOIN aggregate_unit_rating unit_ratings ON unit."unitId" = unit_ratings.unit
    )
    LEFT OUTER JOIN get_unit_visit unit_visit ON unit."unitId" = unit_visit.unit
  );