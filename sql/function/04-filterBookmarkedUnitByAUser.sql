CREATE OR REPLACE FUNCTION filter_bookmarked_unit_by_a_user (userId TEXT DEFAULT NULL) RETURNS TABLE (id INTEGER, utariUser TEXT, timeCreated TIMESTAMPTZ) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  unit,
  utari_user,
  time_created
FROM
  unit_bookmarked
WHERE
  (
    userId IS NULL
    OR utari_user = userId
  );
END;
$$