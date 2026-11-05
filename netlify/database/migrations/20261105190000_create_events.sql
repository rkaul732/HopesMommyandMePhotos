CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  address TEXT,
  start_time TIME,
  end_time TIME,
  registration_mode TEXT NOT NULL CHECK (registration_mode IN ('appointment', 'general')),
  appointment_minutes INTEGER CHECK (appointment_minutes BETWEEN 5 AND 240),
  capacity INTEGER CHECK (capacity > 0),
  registration_count INTEGER NOT NULL DEFAULT 0 CHECK (registration_count >= 0),
  legacy_kind TEXT UNIQUE CHECK (legacy_kind IN ('photos', 'music')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (registration_mode = 'general' OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time AND appointment_minutes IS NOT NULL))
);

CREATE TABLE event_registrations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  slot_index INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX event_registrations_unique_appointment ON event_registrations (event_id, slot_index) WHERE slot_index IS NOT NULL;
CREATE INDEX event_registrations_by_event ON event_registrations (event_id, created_at);

INSERT INTO events (slug, title, event_date, address, start_time, end_time, registration_mode, appointment_minutes, capacity, legacy_kind)
VALUES
  ('mommy-and-me-photos', 'Mommy & Me Photos', '2026-11-22', 'Salt Bridge Farm, 1521 Silverton Road, Toms River, NJ', '09:00', '13:00', 'appointment', 15, 15, 'photos'),
  ('mommy-and-me-music', 'Mommy & Me Music Class', '2026-11-25', NULL, '09:30', NULL, 'general', NULL, 10, 'music');
