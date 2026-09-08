-- Threshold — licensed childcare / after-school operations
-- All user-facing rows are scoped through center_members.user_id (TEXT).

create table if not exists centers (
  id              text primary key,
  name            text not null,
  license_no      text not null default '',
  address         text not null default '',
  timezone        text not null default 'Europe/Madrid',
  created_at      timestamptz not null default now()
);

create table if not exists center_members (
  center_id       text not null references centers(id) on delete cascade,
  user_id         text not null,
  role            text not null default 'teacher',
  display_name    text not null default '',
  created_at      timestamptz not null default now(),
  primary key (center_id, user_id)
);
create index if not exists center_members_user_id_idx on center_members (user_id);

create table if not exists rooms (
  id              text primary key,
  center_id       text not null references centers(id) on delete cascade,
  name            text not null,
  age_band        text not null default '',
  capacity        integer not null default 16,
  ratio_adults    integer not null default 1,
  ratio_children  integer not null default 10,
  sort_order      integer not null default 0
);
create index if not exists rooms_center_id_idx on rooms (center_id);

create table if not exists children (
  id              text primary key,
  center_id       text not null references centers(id) on delete cascade,
  room_id         text references rooms(id) on delete set null,
  first_name      text not null,
  last_name       text not null,
  date_of_birth   date,
  allergies       text not null default '',
  medical_notes   text not null default '',
  status          text not null default 'enrolled',
  waitlist_rank   integer,
  created_at      timestamptz not null default now()
);
create index if not exists children_center_id_idx on children (center_id);
create index if not exists children_room_id_idx on children (room_id);
create index if not exists children_status_idx on children (center_id, status);

create table if not exists guardians (
  id              text primary key,
  child_id        text not null references children(id) on delete cascade,
  center_id       text not null references centers(id) on delete cascade,
  name            text not null,
  relationship    text not null default 'parent',
  phone           text not null default '',
  email           text not null default '',
  can_pickup      boolean not null default true,
  is_emergency    boolean not null default false,
  pickup_pin      text not null default '',
  created_at      timestamptz not null default now()
);
create index if not exists guardians_child_id_idx on guardians (child_id);
create index if not exists guardians_center_id_idx on guardians (center_id);

create table if not exists attendance (
  id                  text primary key,
  center_id           text not null references centers(id) on delete cascade,
  child_id            text not null references children(id) on delete cascade,
  check_in_at         timestamptz not null default now(),
  check_out_at        timestamptz,
  check_in_by         text not null default '',
  check_out_by        text not null default '',
  pickup_guardian_id  text references guardians(id) on delete set null
);
create index if not exists attendance_center_day_idx on attendance (center_id, check_in_at);
create index if not exists attendance_child_open_idx on attendance (child_id, check_out_at);

create table if not exists incidents (
  id              text primary key,
  center_id       text not null references centers(id) on delete cascade,
  child_id        text not null references children(id) on delete cascade,
  reported_by     text not null,
  kind            text not null default 'other',
  severity        text not null default 'low',
  occurred_at     timestamptz not null default now(),
  body            text not null default '',
  parent_notified boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists incidents_center_id_idx on incidents (center_id, occurred_at desc);

create table if not exists daily_notes (
  id              text primary key,
  center_id       text not null references centers(id) on delete cascade,
  child_id        text not null references children(id) on delete cascade,
  author_id       text not null,
  note_date       date not null default current_date,
  meals           text not null default '',
  naps            text not null default '',
  mood            text not null default '',
  body            text not null default '',
  created_at      timestamptz not null default now()
);
create index if not exists daily_notes_center_date_idx on daily_notes (center_id, note_date desc);

create table if not exists staff (
  id              text primary key,
  center_id       text not null references centers(id) on delete cascade,
  user_id         text,
  name            text not null,
  role            text not null default 'teacher',
  phone           text not null default '',
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists staff_center_id_idx on staff (center_id);

create table if not exists activity_events (
  id              text primary key,
  center_id       text not null references centers(id) on delete cascade,
  actor_id        text not null,
  summary         text not null,
  created_at      timestamptz not null default now()
);
create index if not exists activity_events_center_id_idx on activity_events (center_id, created_at desc);
