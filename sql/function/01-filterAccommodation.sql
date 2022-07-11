CREATE
OR REPLACE FUNCTION filter_accommodation (regions TEXT [ ], SEARCH TEXT DEFAULT NULL) RETURNS TABLE (
  accommodation_id INTEGER,
  accommodation_handler TEXT,
  accommodation_address TEXT,
  accommodation_latitude DOUBLE PRECISION,
  accommodation_longitude DOUBLE PRECISION,
  accommodation_MONTH TEXT,
  accommodation_YEAR INTEGER,
  accommodation_facilities TEXT,
  accommodation_remark TEXT
) LANGUAGE plpgsql AS $$
BEGIN 
  RETURN QUERY
SELECT
  id,
  handler,
  address,
  latitude,
  longitude,
  MONTH :: TEXT,
  YEAR,
  facilities,
  remark
FROM
  accommodation
WHERE
  available = TRUE
  AND (region = ANY(regions :: Region [ ]))
  AND (
    SEARCH IS NULL
    OR (
      strict_word_similarity(SEARCH, address) >= 0.1
      OR strict_word_similarity(SEARCH, remark) >= 0.1
      OR strict_word_similarity(SEARCH, facilities) >= 0.1
    )
  );
END;
$$