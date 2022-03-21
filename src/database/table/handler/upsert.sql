/*
 @name Upsert
 @param params -> (id!, handlerType!, name!)
 */
INSERT INTO
  handler (id, handler_type, name)
VALUES
  :params ON CONFLICT (id) DO
UPDATE
SET
  handler_type = :handlerType !,
  name = :name ! RETURNING id;