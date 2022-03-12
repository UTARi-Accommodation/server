/* @name SelectCapacitiesRange */
SELECT
  ARRAY_AGG(DISTINCT capacities) AS capacities
FROM
  (
    (
      (
        SELECT
          id
        FROM
          accommodation
        WHERE
          region = :region !
      ) accommodation
      JOIN (
        SELECT
          id,
          accommodation
        FROM
          room
        WHERE
          available = true
          AND room_type = :roomType !
      ) room ON accommodation.id = room.accommodation
    )
    JOIN (
      SELECT
        capacities,
        room
      FROM
        room_capacity
    ) room_capacity ON room_capacity.room = room.id
  );