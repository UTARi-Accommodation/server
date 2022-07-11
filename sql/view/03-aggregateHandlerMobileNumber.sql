CREATE OR REPLACE VIEW aggregate_handler_mobile_number AS
SELECT
  HANDLER AS mn_handler,
  ARRAY_AGG(
    mobile_number
    ORDER BY
      mobile_number ASC
  ) "mobileNumbers"
FROM
  mobile_number
GROUP BY
  HANDLER;