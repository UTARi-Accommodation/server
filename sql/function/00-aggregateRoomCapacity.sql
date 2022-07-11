CREATE OR REPLACE FUNCTION aggregate_room_capacity (room_capacities_queried INTEGER [ ] DEFAULT NULL) RETURNS TABLE (id INTEGER, aggregation INTEGER [ ]) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  room,
  ARRAY_AGG(
    capacities
    ORDER BY
      capacities ASC
  ) "roomCapacities"
FROM
  room_capacity
WHERE
  room_capacities_queried IS NULL
  OR capacities = ANY(room_capacities_queried)
GROUP BY
  room;
END;
$$