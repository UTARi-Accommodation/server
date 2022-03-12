/* 
 @name Insert
 @param params -> (timeStarted!, timeCompleted!)
 */
INSERT INTO
  time_scrap (time_started, time_completed)
VALUES
  :params RETURNING id,
  time_started,
  time_completed;