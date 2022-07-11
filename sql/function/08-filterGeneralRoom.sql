CREATE
OR REPLACE FUNCTION filter_general_room (
  region_queried TEXT,
  roomType_queried TEXT,
  capacities_queried INTEGER [ ],
  SEARCH TEXT DEFAULT NULL,
  minRental NUMERIC(10, 2) DEFAULT NULL,
  maxRental NUMERIC(10, 2) DEFAULT NULL,
  userId TEXT DEFAULT NULL
) RETURNS TABLE (
  room_id INTEGER,
  room_score DOUBLE PRECISION,
  room_address TEXT,
  room_latitude DOUBLE PRECISION,
  room_longitude DOUBLE PRECISION,
  room_facilities TEXT,
  room_YEAR INTEGER,
  room_MONTH TEXT,
  room_room_size TEXT,
  room_rental NUMERIC(10, 2),
  room_capacities INTEGER [ ],
  room_ratings INTEGER [ ],
  room_utari_user TEXT
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT 
  roomId,
  roomScore,
  accommodation_address,
  accommodation_latitude,
  accommodation_longitude,
  accommodation_facilities,
  accommodation_YEAR,
  accommodation_MONTH,
  size,
  roomRental,
  aggregation,
  ratings,
  utariUser
FROM 
(
  (
    (
      (
        (
          filter_accommodation(ARRAY [region_queried], SEARCH)
            accommodation
          JOIN filter_room(ARRAY[roomType_queried], minRental, maxRental)
            room ON accommodation.accommodation_id = room.roomAccommodation
        )
        LEFT OUTER JOIN filter_bookmarked_room_by_a_user(userId)
          room_bookmarked ON room_bookmarked.id = room.roomId
      )
    )
    LEFT OUTER JOIN aggregate_room_rating
      room_ratings ON room.roomId = room_ratings.room
  )
  JOIN aggregate_room_capacity(capacities_queried)
    room_capacity ON room.roomId = room_capacity.id
);
END;
$$