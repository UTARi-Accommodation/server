-- CREATE TYPE
CREATE TYPE Region AS ENUM ('KP', 'SL', 'BTHO');
CREATE TYPE Month AS ENUM ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
CREATE TYPE UnitType AS ENUM ('House', 'Condominium');
CREATE TYPE RoomType AS ENUM ('Room', 'Roommate');
CREATE TYPE RoomSize AS ENUM ('Master', 'Middle', 'Small');
CREATE TYPE HandlerType AS ENUM ('Agent', 'Owner', 'Tenant');
CREATE TYPE AccommodationType AS ENUM ('Unit', 'Room');

-- CREATE TABLE

-- CREATE utari_user
CREATE TABLE IF NOT EXISTS utari_user (
  id TEXT PRIMARY KEY NOT NULL,
  time_created TIMESTAMPTZ NOT NULL,
  time_deleted TIMESTAMPTZ NULL
);

-- CREATE visitor
CREATE TABLE IF NOT EXISTS visitor (
  id TEXT PRIMARY KEY NOT NULL,
  time_created TIMESTAMPTZ NOT NULL
);

-- CREATE handler
CREATE TABLE IF NOT EXISTS handler (
  id TEXT PRIMARY KEY NOT NULL,
  handler_type HandlerType NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email (
  id SERIAL PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  handler TEXT NOT NULL REFERENCES handler (id),
  UNIQUE (email, handler)
);

CREATE TABLE IF NOT EXISTS mobile_number (
  id SERIAL PRIMARY KEY NOT NULL,
  mobile_number TEXT NOT NULL,
  handler TEXT NOT NULL REFERENCES handler (id),
  UNIQUE (mobile_number, handler)
);

CREATE TABLE IF NOT EXISTS time_scrap (
  id SERIAL PRIMARY KEY NOT NULL,
  time_started TIMESTAMPTZ NOT NULL,
  time_completed TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS accommodation (
  id INTEGER PRIMARY KEY NOT NULL,
  handler TEXT NOT NULL REFERENCES handler (id),
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  remark TEXT NOT NULL,
  month MONTH NOT NULL,
  year INTEGER NOT NULL,
  region Region NOT NULL,
  facilities TEXT NOT NULL,
  accommodation_type AccommodationType NOT NULL,
  available BOOLEAN NOT NULL
);

-- CREATE UNIT
CREATE TABLE IF NOT EXISTS unit (
  id SERIAL PRIMARY KEY NOT NULL,
  accommodation INTEGER NOT NULL REFERENCES accommodation (id),
  UNIQUE (accommodation),
  bath_rooms INTEGER NOT NULL,
  bed_rooms INTEGER NOT NULL,
  rental MONEY NOT NULL,
  unit_type UnitType NOT NULL,
  available BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS unit_rating (
  id SERIAL PRIMARY KEY NOT NULL,
  utari_user TEXT NOT NULL REFERENCES utari_user (id),
  unit INTEGER NOT NULL REFERENCES unit (id),
  rating DOUBLE PRECISION NOT NULL,
  time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS unit_bookmarked (
  id SERIAL PRIMARY KEY NOT NULL,
  utari_user TEXT NOT NULL REFERENCES utari_user (id),
  unit INTEGER NOT NULL REFERENCES unit (id),
  UNIQUE (unit, utari_user),
  time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS unit_visit (
  id SERIAL PRIMARY KEY NOT NULL,
  visitor TEXT NOT NULL REFERENCES visitor (id),
  unit INTEGER NOT NULL REFERENCES unit (id),
  time_created TIMESTAMPTZ NOT NULL
);

-- CREATE room
CREATE TABLE IF NOT EXISTS room (
  id SERIAL PRIMARY KEY NOT NULL,
  accommodation INTEGER NOT NULL REFERENCES accommodation (id),
  room_type RoomType NOT NULL,
  UNIQUE (accommodation, room_size),
  room_size RoomSize NOT NULL,
  rental MONEY NOT NULL,
  available BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS room_capacity (
  id SERIAL PRIMARY KEY NOT NULL,
  room INTEGER NOT NULL REFERENCES room (id),
  capacities INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS room_rating (
  id SERIAL PRIMARY KEY NOT NULL,
  utari_user TEXT NOT NULL REFERENCES utari_user (id),
  room INTEGER NOT NULL REFERENCES room (id),
  rating DOUBLE PRECISION NOT NULL,
  time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS room_bookmarked (
  id SERIAL PRIMARY KEY NOT NULL,
  utari_user TEXT NOT NULL REFERENCES utari_user (id),
  room INTEGER NOT NULL REFERENCES room (id),
  UNIQUE (room, utari_user),
  time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS room_visit (
  id SERIAL PRIMARY KEY NOT NULL,
  visitor TEXT NOT NULL REFERENCES visitor (id),
  room INTEGER NOT NULL REFERENCES room (id),
  time_created TIMESTAMPTZ NOT NULL
);
