SELECT *
FROM
((((((
    SELECT id, handler, address, latitude, longitude, remark, month, year, region, facilities, accommodation_type
    FROM accommodation
    WHERE available=true AND region='KP'
) accommodation
JOIN
(
    SELECT id, accommodation, bath_rooms, bed_rooms, rental, unit_type
    FROM unit
    WHERE available=true
) unit
ON accommodation.id=unit.accommodation)
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
    SELECT unit, rating
    FROM unit_rating
) unit_rating
ON unit.id=unit_rating.unit)
LEFT OUTER JOIN
(
    SELECT unit, COUNT(*) as visitCount
    FROM unit_visit
    GROUP BY unit
) unit_visit
ON unit.id=unit_visit.unit)
