/* @name SelectCapacitiesRange */
SELECT
  ARRAY_AGG(
    DISTINCT capacities
    ORDER BY
      capacities ASC
  ) AS capacities
FROM
  (
    (
      SELECT
        rid
      FROM
        filter_general_room_meta_data
      WHERE
        region = :region !
        AND room_type = :roomType !
    ) room
    JOIN filter_room_capacity room_capacity ON room_capacity.room = room.rid
  );