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
        id,
        rental
      FROM
        filter_bookmarked_room_meta_data
      WHERE
        utari_user = :userId !
    ) room
    JOIN filter_room_capacity room_capacity ON room_capacity.room = room.id
  );