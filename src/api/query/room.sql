SELECT *
FROM
(((((((
    SELECT id, handler, address, latitude, longitude, remark, month, year, region, facilities, accommodation_type
    FROM accommodation
    WHERE available=true AND region='KP'
) accommodation
JOIN
(
    SELECT id, accommodation, rental, room_type, room_size
    FROM room
    WHERE available=true
) room
ON accommodation.id=room.accommodation)
LEFT OUTER JOIN
(
    SELECT id, handler
    FROM email
) email
ON accommodation.handler=email.handler)
LEFT OUTER JOIN
(
    SELECT id, handler
    FROM mobile_number
) mobile_number
ON accommodation.handler=mobile_number.handler)
LEFT OUTER JOIN
(
    SELECT room, rating
    FROM room_rating
) room_rating
ON room.id=room_rating.room)
LEFT OUTER JOIN
(
    SELECT room, COUNT(*)
    FROM room_visit
    GROUP BY room
) room_visit
ON room.id=room_visit.room)
JOIN
(
    SELECT room, capacity
    FROM room_capacity
) room_capacity
ON room.id=room_capacity.room)
