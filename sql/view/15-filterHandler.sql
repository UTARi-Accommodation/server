CREATE OR REPLACE VIEW filter_handler AS
SELECT
  id,
  handler_type AS "handlerType",
  NAME
FROM
  HANDLER;