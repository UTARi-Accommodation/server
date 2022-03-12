/* @name SelectCapacitiesRange */
SELECT
  ARRAY_AGG(DISTINCT capacities) AS capacities
FROM
  (
    (
      (
        SELECT
          room
        FROM
          room_bookmarked
        WHERE
          utari_user = :userId !
      ) room_bookmarked
      JOIN (
        SELECT
          id,
          rental
        FROM
          room
        WHERE
          available = true
      ) room ON room_bookmarked.room = room.id
    )
    JOIN (
      SELECT
        capacities,
        room
      FROM
        room_capacity
    ) room_capacity ON room_capacity.room = room.id
  );