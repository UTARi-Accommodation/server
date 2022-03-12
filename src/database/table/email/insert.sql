/*
 @name Insert
 @param params -> (email!, handler!)
 */
INSERT INTO
  email (email, handler)
VALUES
  :params ON CONFLICT (email, handler) DO NOTHING RETURNING email,
  handler;