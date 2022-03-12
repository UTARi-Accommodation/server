/*
 @name Insert
 @param params -> (mobileNumber!, handler!)
 */
INSERT INTO
  mobile_number (mobile_number, handler)
VALUES
  :params ON CONFLICT (mobile_number, handler) DO NOTHING RETURNING mobile_number,
  handler;