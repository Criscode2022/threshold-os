import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { sql } from "../db.js";
import { seedWillowGrove } from "./seed.js";

type Member = { id: string; name: string; license_no: string; address: string; timezone: string; role: string; display_name: string };

@Injectable()
export class DeskService {
  private async centerFor(userId: string): Promise<Member | null> {
    const rows = await sql<Member>(
      `select c.id, c.name, c.license_no, c.address, c.timezone, m.role, m.display_name
       from center_members m join centers c on c.id = m.center_id
       where m.user_id = $1 order by c.created_at asc limit 1`,
      [userId],
    );
    return rows[0] ?? null;
  }

  private async requireCenter(userId: string) {
    const center = await this.centerFor(userId);
    if (!center) throw new ForbiddenException("No center");
    return center;
  }

  private async activity(centerId: string, actorId: string, summary: string) {
    await sql(`insert into activity_events (id, center_id, actor_id, summary) values ($1,$2,$3,$4)`,
      [crypto.randomUUID(), centerId, actorId, summary]);
  }

  me(userId: string) {
    return this.centerFor(userId);
  }

  async sample(userId: string, displayName: string) {
    const existing = await this.centerFor(userId);
    if (existing) return existing;
    await seedWillowGrove(userId, displayName);
    return this.requireCenter(userId);
  }

  async create(userId: string, body: { name: string; licenseNo?: string; address?: string; directorName: string }) {
    const existing = await this.centerFor(userId);
    if (existing) return existing;
    const centerId = crypto.randomUUID();
    await sql(`insert into centers (id, name, license_no, address) values ($1,$2,$3,$4)`,
      [centerId, body.name, body.licenseNo ?? "", body.address ?? ""]);
    await sql(`insert into center_members (center_id, user_id, role, display_name) values ($1,$2,$3,$4)`,
      [centerId, userId, "director", body.directorName]);
    const rooms: [string, string, number, number, number, number][] = [
      ["Acorns", "3–4 years", 16, 1, 8, 0],
      ["Maples", "5–6 years", 20, 1, 10, 1],
      ["Cedars", "7–9 years", 18, 1, 12, 2],
    ];
    for (const r of rooms) {
      await sql(
        `insert into rooms (id, center_id, name, age_band, capacity, ratio_adults, ratio_children, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [crypto.randomUUID(), centerId, r[0], r[1], r[2], r[3], r[4], r[5]],
      );
    }
    await this.activity(centerId, userId, `${body.directorName} opened ${body.name}`);
    return this.requireCenter(userId);
  }

  async dashboard(userId: string) {
    const center = await this.centerFor(userId);
    if (!center) return null;
    const [present] = await sql<{ n: number }>(`select count(*)::int as n from attendance where center_id=$1 and check_out_at is null`, [center.id]);
    const [enrolled] = await sql<{ n: number }>(`select count(*)::int as n from children where center_id=$1 and status='enrolled'`, [center.id]);
    const [waitlist] = await sql<{ n: number }>(`select count(*)::int as n from children where center_id=$1 and status='waitlist'`, [center.id]);
    const [openInc] = await sql<{ n: number }>(`select count(*)::int as n from incidents where center_id=$1 and parent_notified=false`, [center.id]);
    const rooms = await sql(
      `select r.*, (select count(*)::int from children ch where ch.room_id=r.id and ch.status='enrolled') as enrolled,
              (select count(*)::int from attendance a join children ch on ch.id=a.child_id
               where ch.room_id=r.id and a.check_out_at is null) as present
       from rooms r where r.center_id=$1 order by r.sort_order`,
      [center.id],
    );
    const childrenIn = await sql(
      `select c.*, r.name as room_name, a.check_in_at
       from attendance a join children c on c.id=a.child_id
       left join rooms r on r.id=c.room_id
       where a.center_id=$1 and a.check_out_at is null order by a.check_in_at`,
      [center.id],
    );
    const incidents = await sql(
      `select i.*, c.first_name || ' ' || c.last_name as child_name
       from incidents i join children c on c.id=i.child_id
       where i.center_id=$1 and i.parent_notified=false order by i.occurred_at desc limit 5`,
      [center.id],
    );
    const activity = await sql(
      `select id, summary, created_at from activity_events where center_id=$1 order by created_at desc limit 8`,
      [center.id],
    );
    return {
      center,
      rooms,
      present: present?.n ?? 0,
      enrolled: enrolled?.n ?? 0,
      waitlist: waitlist?.n ?? 0,
      openIncidents: openInc?.n ?? 0,
      childrenIn,
      incidents,
      activity,
    };
  }

  async rooms(userId: string) {
    const center = await this.requireCenter(userId);
    return sql(
      `select r.*, (select count(*)::int from children ch where ch.room_id=r.id and ch.status='enrolled') as enrolled,
              (select count(*)::int from attendance a join children ch on ch.id=a.child_id
               where ch.room_id=r.id and a.check_out_at is null) as present
       from rooms r where r.center_id=$1 order by r.sort_order`,
      [center.id],
    );
  }

  async children(userId: string, status = "enrolled") {
    const center = await this.requireCenter(userId);
    return sql(
      `select c.*, r.name as room_name,
              exists(select 1 from attendance a where a.child_id=c.id and a.check_out_at is null) as present,
              (select a.check_in_at from attendance a where a.child_id=c.id and a.check_out_at is null limit 1) as check_in_at
       from children c left join rooms r on r.id=c.room_id
       where c.center_id=$1 and c.status=$2
       order by c.waitlist_rank nulls last, c.last_name, c.first_name`,
      [center.id, status],
    );
  }

  async child(userId: string, childId: string) {
    const center = await this.requireCenter(userId);
    const kids = await sql(
      `select c.*, r.name as room_name,
              exists(select 1 from attendance a where a.child_id=c.id and a.check_out_at is null) as present
       from children c left join rooms r on r.id=c.room_id
       where c.id=$1 and c.center_id=$2`,
      [childId, center.id],
    );
    if (!kids[0]) throw new NotFoundException("Child not found");
    const guardians = await sql(`select * from guardians where child_id=$1 order by is_emergency desc, name`, [childId]);
    const incidents = await sql(`select * from incidents where child_id=$1 and center_id=$2 order by occurred_at desc`, [childId, center.id]);
    const notes = await sql(`select * from daily_notes where child_id=$1 and center_id=$2 order by note_date desc`, [childId, center.id]);
    return { child: kids[0], guardians, incidents, notes };
  }

  async addChild(userId: string, body: {
    firstName: string; lastName: string; roomId?: string; dateOfBirth?: string;
    allergies?: string; medicalNotes?: string; status?: string;
    guardianName: string; guardianPhone?: string; pickupPin?: string;
  }) {
    const center = await this.requireCenter(userId);
    const childId = crypto.randomUUID();
    const status = body.status ?? "enrolled";
    let rank: number | null = null;
    if (status === "waitlist") {
      const [row] = await sql<{ n: number }>(`select coalesce(max(waitlist_rank),0)::int+1 as n from children where center_id=$1 and status='waitlist'`, [center.id]);
      rank = row?.n ?? 1;
    }
    await sql(
      `insert into children (id, center_id, room_id, first_name, last_name, date_of_birth, allergies, medical_notes, status, waitlist_rank)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [childId, center.id, body.roomId || null, body.firstName, body.lastName, body.dateOfBirth || null,
        body.allergies ?? "", body.medicalNotes ?? "", status, rank],
    );
    await sql(
      `insert into guardians (id, child_id, center_id, name, relationship, phone, can_pickup, is_emergency, pickup_pin)
       values ($1,$2,$3,$4,$5,$6,true,true,$7)`,
      [crypto.randomUUID(), childId, center.id, body.guardianName, "parent", body.guardianPhone ?? "",
        body.pickupPin || String(1000 + Math.floor(Math.random() * 8999))],
    );
    await this.activity(center.id, userId, `Added ${body.firstName} ${body.lastName} (${status})`);
    return { id: childId };
  }

  async checkIn(userId: string, childId: string) {
    const center = await this.requireCenter(userId);
    const child = await sql<{ first_name: string; last_name: string }>(
      `select first_name, last_name from children where id=$1 and center_id=$2`, [childId, center.id],
    );
    if (!child[0]) throw new NotFoundException("Child not found");
    const open = await sql<{ id: string }>(`select id from attendance where child_id=$1 and check_out_at is null`, [childId]);
    if (open[0]) return { id: open[0].id, already: true };
    const attId = crypto.randomUUID();
    await sql(
      `insert into attendance (id, center_id, child_id, check_in_at, check_in_by) values ($1,$2,$3,$4,$5)`,
      [attId, center.id, childId, new Date().toISOString(), center.display_name],
    );
    await this.activity(center.id, userId, `${child[0].first_name} ${child[0].last_name} checked in`);
    return { id: attId, already: false };
  }

  async checkOut(userId: string, childId: string, pin: string) {
    const center = await this.requireCenter(userId);
    const guardian = await sql<{ id: string; name: string }>(
      `select id, name from guardians where child_id=$1 and center_id=$2 and can_pickup=true and pickup_pin=$3 limit 1`,
      [childId, center.id, pin],
    );
    if (!guardian[0]) throw new BadRequestException("PIN does not match an authorized adult");
    const open = await sql<{ id: string }>(
      `select id from attendance where child_id=$1 and center_id=$2 and check_out_at is null order by check_in_at desc limit 1`,
      [childId, center.id],
    );
    if (!open[0]) throw new BadRequestException("Child is not currently signed in");
    await sql(
      `update attendance set check_out_at=$1, check_out_by=$2, pickup_guardian_id=$3 where id=$4 and center_id=$5`,
      [new Date().toISOString(), center.display_name, guardian[0].id, open[0].id, center.id],
    );
    const child = await sql<{ first_name: string; last_name: string }>(
      `select first_name, last_name from children where id=$1 and center_id=$2`, [childId, center.id],
    );
    await this.activity(center.id, userId, `${child[0]?.first_name ?? "Child"} released to ${guardian[0].name}`);
    return { ok: true, guardian: guardian[0].name };
  }

  async attendance(userId: string) {
    const center = await this.requireCenter(userId);
    return sql(
      `select a.*, c.first_name || ' ' || c.last_name as child_name, r.name as room_name, g.name as pickup_guardian
       from attendance a join children c on c.id=a.child_id
       left join rooms r on r.id=c.room_id left join guardians g on g.id=a.pickup_guardian_id
       where a.center_id=$1 and a.check_in_at >= date_trunc('day', now())
       order by a.check_in_at desc`,
      [center.id],
    );
  }

  async incidents(userId: string) {
    const center = await this.requireCenter(userId);
    return sql(
      `select i.*, c.first_name || ' ' || c.last_name as child_name
       from incidents i join children c on c.id=i.child_id
       where i.center_id=$1 order by i.occurred_at desc limit 50`,
      [center.id],
    );
  }

  async addIncident(userId: string, body: { childId: string; kind: string; severity: string; text: string; parentNotified?: boolean }) {
    const center = await this.requireCenter(userId);
    const child = await sql<{ first_name: string; last_name: string }>(
      `select first_name, last_name from children where id=$1 and center_id=$2`, [body.childId, center.id],
    );
    if (!child[0]) throw new NotFoundException("Child not found");
    const id = crypto.randomUUID();
    await sql(
      `insert into incidents (id, center_id, child_id, reported_by, kind, severity, occurred_at, body, parent_notified)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, center.id, body.childId, center.display_name, body.kind, body.severity, new Date().toISOString(), body.text, body.parentNotified ?? false],
    );
    await this.activity(center.id, userId, `Incident (${body.kind}) logged for ${child[0].first_name} ${child[0].last_name}`);
    return { id };
  }

  async notify(userId: string, incidentId: string) {
    const center = await this.requireCenter(userId);
    await sql(`update incidents set parent_notified=true where id=$1 and center_id=$2`, [incidentId, center.id]);
    return { ok: true };
  }

  async notes(userId: string) {
    const center = await this.requireCenter(userId);
    return sql(
      `select n.*, c.first_name || ' ' || c.last_name as child_name
       from daily_notes n join children c on c.id=n.child_id
       where n.center_id=$1 order by n.note_date desc, n.created_at desc limit 40`,
      [center.id],
    );
  }

  async addNote(userId: string, body: { childId: string; meals?: string; naps?: string; mood?: string; text: string }) {
    const center = await this.requireCenter(userId);
    const id = crypto.randomUUID();
    await sql(
      `insert into daily_notes (id, center_id, child_id, author_id, note_date, meals, naps, mood, body)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, center.id, body.childId, userId, new Date().toISOString().slice(0, 10),
        body.meals ?? "", body.naps ?? "", body.mood ?? "", body.text],
    );
    return { id };
  }

  async staff(userId: string) {
    const center = await this.requireCenter(userId);
    return sql(`select * from staff where center_id=$1 order by name`, [center.id]);
  }

  async addStaff(userId: string, body: { name: string; role: string; phone?: string }) {
    const center = await this.requireCenter(userId);
    const id = crypto.randomUUID();
    await sql(`insert into staff (id, center_id, name, role, phone, active) values ($1,$2,$3,$4,$5,true)`,
      [id, center.id, body.name, body.role, body.phone ?? ""]);
    return { id };
  }

  async enroll(userId: string, childId: string) {
    const center = await this.requireCenter(userId);
    const child = await sql<{ first_name: string; last_name: string }>(
      `select first_name, last_name from children where id=$1 and center_id=$2 and status='waitlist'`,
      [childId, center.id],
    );
    if (!child[0]) throw new NotFoundException("Waitlist record not found");
    await sql(`update children set status='enrolled', waitlist_rank=null where id=$1 and center_id=$2`, [childId, center.id]);
    await this.activity(center.id, userId, `${child[0].first_name} ${child[0].last_name} enrolled from the waitlist`);
    return { ok: true };
  }

  async updateCenter(userId: string, body: { name: string; licenseNo: string; address: string }) {
    const center = await this.requireCenter(userId);
    await sql(`update centers set name=$1, license_no=$2, address=$3 where id=$4`,
      [body.name, body.licenseNo, body.address, center.id]);
    return { ok: true };
  }
}
