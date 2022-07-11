CREATE
OR REPLACE VIEW get_rooms_to_update_score AS
SELECT
  "roomId",
  "mobileNumbers" AS "mobileNumber",
  emails AS email,
  address,
  latitude,
  longitude,
  facilities,
  remark,
  YEAR,
  MONTH,
  "roomSize",
  rental,
  aggregation AS capacities,
  ratings,
  "visitCount"
FROM
  (
    (
      (
        (
          (
            filter_detailed_room_by_id room
            LEFT OUTER JOIN aggregate_handler_email email ON room.handler = email.handler
          )
          LEFT OUTER JOIN aggregate_handler_mobile_number mobile_number ON room.handler = mobile_number.mn_handler
        )
        LEFT OUTER JOIN aggregate_room_rating room_ratings ON room."roomId" = room_ratings.room
      )
      LEFT OUTER JOIN get_room_visit room_visit ON room."roomId" = room_visit.room
    )
    JOIN aggregate_room_capacity() room_capacity ON room."roomId" = room_capacity.id
  );