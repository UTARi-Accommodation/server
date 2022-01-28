-- DROP DATABASE
DROP DATABASE IF EXISTS utari;
-- CREATE DATABASE
CREATE DATABASE utari;

-- DROP TYPE
DROP TYPE IF EXISTS Region CASCADE; 
DROP TYPE IF EXISTS Month CASCADE;
DROP TYPE IF EXISTS UnitType CASCADE; 
DROP TYPE IF EXISTS RoomType CASCADE; 
DROP TYPE IF EXISTS RoomSize CASCADE; 
DROP TYPE IF EXISTS HandlerType CASCADE;
DROP TYPE IF EXISTS MobileNumberType CASCADE;
DROP TYPE IF EXISTS AccommodationType CASCADE;
-- CREATE TYPE
CREATE TYPE Region AS ENUM ('KP', 'SL', 'BTHO');
CREATE TYPE Month AS ENUM ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
CREATE TYPE UnitType AS ENUM ('House', 'ApartmentCondominium');
CREATE TYPE RoomType AS ENUM ('Room', 'Roommate');
CREATE TYPE RoomSize AS ENUM ('Master', 'Middle', 'Small');
CREATE TYPE HandlerType AS ENUM ('Agent', 'Owner', 'Tenant');
CREATE TYPE MobileNumberType AS ENUM ('Mobile', 'Line');
CREATE TYPE AccommodationType AS ENUM ('Unit', 'Room');

-- DROP TABLE
DROP TABLE IF EXISTS finger_print CASCADE;
DROP TABLE IF EXISTS handler CASCADE;
DROP TABLE IF EXISTS email CASCADE;
DROP TABLE IF EXISTS mobile_number CASCADE;
DROP TABLE IF EXISTS time_scrap CASCADE;
DROP TABLE IF EXISTS accommodation CASCADE;
DROP TABLE IF EXISTS unit CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS room_capacity CASCADE;
DROP TABLE IF EXISTS unit_rating CASCADE;
DROP TABLE IF EXISTS unit_saved CASCADE;
DROP TABLE IF EXISTS unit_visit CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS room_rating CASCADE;
DROP TABLE IF EXISTS room_saved CASCADE;
DROP TABLE IF EXISTS room_visit CASCADE;

-- CREATE TABLE
-- CREATE USER
CREATE TABLE finger_print (
	id TEXT PRIMARY KEY NOT NULL,
	time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE handler (
	id TEXT PRIMARY KEY NOT NULL,
	handler_type HandlerType NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE email (
	id TEXT PRIMARY KEY NOT NULL,
	handler TEXT NOT NULL REFERENCES handler (id)
);

CREATE TABLE mobile_number (
	id TEXT PRIMARY KEY NOT NULL,
    mobile_number_type MobileNumberType NOT NULL, 
	handler TEXT NOT NULL REFERENCES handler (id)
);

CREATE TABLE time_scrap (
	id INTEGER PRIMARY KEY NOT NULL,
	time_started TIMESTAMPTZ NOT NULL,
	time_completed TIMESTAMPTZ NOT NULL
);

CREATE TABLE accommodation (
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
CREATE TABLE unit (
	id SERIAL PRIMARY KEY NOT NULL,
	accommodation INTEGER NOT NULL REFERENCES accommodation (id) UNIQUE,
	bath_rooms INTEGER NOT NULL,
	bed_rooms INTEGER NOT NULL,
	rental MONEY NOT NULL,
	unit_type UnitType NOT NULL,
    available BOOLEAN NOT NULL
);

CREATE TABLE unit_rating (
	id SERIAL PRIMARY KEY NOT NULL,
	unit INTEGER NOT NULL REFERENCES unit (id),
	finger_print TEXT NOT NULL REFERENCES finger_print (id),
	rating DOUBLE PRECISION NOT NULL,
	time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE unit_saved (
	id SERIAL PRIMARY KEY NOT NULL,
	unit INTEGER NOT NULL REFERENCES unit (id),
	finger_print TEXT NOT NULL REFERENCES finger_print(id),
	time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE unit_visit (
	id SERIAL PRIMARY KEY NOT NULL,
	unit INTEGER NOT NULL REFERENCES unit (id),
	finger_print TEXT NOT NULL REFERENCES finger_print(id),
	time_created TIMESTAMPTZ NOT NULL
);

-- CREATE room
CREATE TABLE room (
	id SERIAL PRIMARY KEY NOT NULL,
	accommodation INTEGER NOT NULL REFERENCES accommodation (id),
	rental MONEY NOT NULL,
	room_type RoomType NOT NULL,
	room_size RoomSize NOT NULL,
    available BOOLEAN NOT NULL
);

CREATE TABLE room_capacity (
	id SERIAL PRIMARY KEY NOT NULL,
	room INTEGER NOT NULL REFERENCES room (id),
	capacity INTEGER NOT NULL
);

CREATE TABLE room_rating (
	id SERIAL PRIMARY KEY NOT NULL,
	room INTEGER NOT NULL REFERENCES room (id),
	finger_print TEXT NOT NULL REFERENCES finger_print(id),
	rating DOUBLE PRECISION NOT NULL,
	time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE room_saved (
	id SERIAL PRIMARY KEY NOT NULL,
	room INTEGER NOT NULL REFERENCES room (id),
	finger_print TEXT NOT NULL REFERENCES finger_print(id),
	time_created TIMESTAMPTZ NOT NULL
);

CREATE TABLE room_visit (
	id SERIAL PRIMARY KEY NOT NULL,
	room INTEGER NOT NULL REFERENCES room (id),
	finger_print TEXT NOT NULL REFERENCES finger_print(id),
	time_created TIMESTAMPTZ NOT NULL
);
