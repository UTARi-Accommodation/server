/* @name Upsert 
 @param params -> (
 accommodation!,
 rental!,
 unitType!,
 bathRooms!,
 bedRooms!,
 available!
 ) */
INSERT INTO
  unit (
    accommodation,
    rental,
    unit_type,
    bath_rooms,
    bed_rooms,
    available
  )
VALUES
  :params ON CONFLICT (accommodation) DO
UPDATE
SET
  rental = :rental !,
  bed_rooms = :bedRooms !,
  bath_rooms = :bathRooms !,
  unit_type = :unitType !,
  available = true RETURNING id;