/*
 @name Upsert
 @param params -> (
 accommodation!,
 rental!,
 roomType!,
 roomSize!,
 available!
 )
 */
INSERT INTO
  room (
    accommodation,
    rental,
    room_type,
    room_size,
    available
  )
VALUES
  :params ON CONFLICT(accommodation, room_size) DO
UPDATE
SET
  rental = :rental !,
  room_type = :roomType !,
  available = TRUE RETURNING id;