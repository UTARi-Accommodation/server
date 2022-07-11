CREATE OR REPLACE FUNCTION filter_bookmarked_room_by_a_user (userId TEXT DEFAULT NULL) RETURNS TABLE (id INTEGER, utariUser TEXT, timeCreated TIMESTAMPTZ) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  room,
  utari_user,
  time_created
FROM
  room_bookmarked
WHERE
  (
    userId IS NULL
    OR utari_user = userId
  );
END;
$$