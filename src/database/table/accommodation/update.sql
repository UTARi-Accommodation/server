/*
 @name Update
 */
UPDATE accommodation
SET
  handler = :handler !,
  remark = :remark !,
  month = :month !,
  year = :year !,
  region = :region !,
  facilities = :facilities !,
  accommodation_type = :accommodationType !,
  available = true
WHERE id = :id!
RETURNING id;
