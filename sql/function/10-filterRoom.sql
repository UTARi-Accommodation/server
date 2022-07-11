CREATE OR REPLACE FUNCTION filter_room (
  roomTypes_queried TEXT [ ],
  minRental NUMERIC(10, 2) DEFAULT NULL,
  maxRental NUMERIC(10, 2) DEFAULT NULL
) RETURNS TABLE (
  roomId INTEGER,
  roomAccommodation INTEGER,
  roomRental NUMERIC(10, 2),
  size TEXT,
  roomScore DOUBLE PRECISION
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  id,
  accommodation,
  rental,
  room_size :: TEXT,
  score
FROM
  room
WHERE
  available = TRUE
  AND (
    minRental IS NULL
    OR rental >= minRental
  )
  AND (
    maxRental IS NULL
    OR rental <= maxRental
  )
  AND (room_type = ANY(roomTypes_queried :: RoomType [ ]));
END;
$$