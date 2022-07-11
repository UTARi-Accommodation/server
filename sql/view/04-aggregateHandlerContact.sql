CREATE
OR REPLACE VIEW aggregate_handler_contact AS
SELECT
  *
FROM
  (
    aggregate_handler_email email
    FULL JOIN aggregate_handler_mobile_number mobile_number ON mobile_number.mn_handler = email.handler
  );