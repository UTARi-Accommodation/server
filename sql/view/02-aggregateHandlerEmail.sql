CREATE
OR REPLACE VIEW aggregate_handler_email AS
SELECT
  HANDLER,
  ARRAY_AGG(
    email
    ORDER BY
      email ASC
  ) emails
FROM
  email
GROUP BY
  HANDLER;