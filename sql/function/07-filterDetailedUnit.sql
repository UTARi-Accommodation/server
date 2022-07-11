CREATE OR REPLACE FUNCTION filter_detailed_unit (unitId INT) RETURNS TABLE (
  email_handler TEXT,
  mobile_number_handler TEXT,
  handler_mobile_number TEXT [ ],
  handler_email TEXT [ ],
  unit_visit_count BIGINT,
  unit_ratings INT [ ]
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  handler,
  mn_handler,
  "mobileNumbers",
  emails,
  "visitCount",
  ratings
FROM
  (
    (
      aggregate_handler_contact
      LEFT OUTER JOIN aggregate_unit_rating
        unit_ratings ON unitId = unit_ratings.unit
    )
    LEFT OUTER JOIN get_unit_visit
      unit_visit ON unitId = unit_visit.unit
  );
END;
$$