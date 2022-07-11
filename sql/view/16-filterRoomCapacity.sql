CREATE OR REPLACE VIEW filter_room_capacity AS
SELECT
  capacities,
  room
FROM
  room_capacity;