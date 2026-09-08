import { sql } from "../db.js";

function id() {
  return crypto.randomUUID();
}
function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export async function seedWillowGrove(userId: string, displayName: string) {
  const centerId = id();
  const director = displayName.trim() || "Director";
  await sql(
    `insert into centers (id, name, license_no, address, timezone)
     values ($1,$2,$3,$4,$5)`,
    [centerId, "Willow Grove After-School", "CM-2841-B", "14 Carrer de l'Ombral, 08012 Barcelona", "Europe/Madrid"],
  );
  await sql(
    `insert into center_members (center_id, user_id, role, display_name) values ($1,$2,$3,$4)`,
    [centerId, userId, "director", director],
  );

  const acorns = id();
  const maples = id();
  const cedars = id();
  const rooms: [string, string, string, number, number, number, number][] = [
    [acorns, "Acorns", "3–4 years", 16, 1, 8, 0],
    [maples, "Maples", "5–6 years", 20, 1, 10, 1],
    [cedars, "Cedars", "7–9 years", 18, 1, 12, 2],
  ];
  for (const r of rooms) {
    await sql(
      `insert into rooms (id, center_id, name, age_band, capacity, ratio_adults, ratio_children, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [r[0], centerId, r[1], r[2], r[3], r[4], r[5], r[6]],
    );
  }

  type G = { name: string; relationship: string; phone: string; email: string; pin: string; emergency?: boolean };
  const kids: {
    first: string; last: string; dob: string; room: string; allergies: string; medical: string;
    status: "enrolled" | "waitlist"; rank: number | null; presentHours?: number; guardians: G[];
  }[] = [
    { first: "Inés", last: "Navarro", dob: "2021-04-12", room: acorns, allergies: "Peanuts", medical: "EpiPen in office drawer B", status: "enrolled", rank: null, presentHours: 4.2,
      guardians: [
        { name: "Marta Navarro", relationship: "mother", phone: "+34 622 104 881", email: "marta.navarro@example.com", pin: "4419", emergency: true },
        { name: "Pau Serra", relationship: "father", phone: "+34 633 902 114", email: "pau.serra@example.com", pin: "8821" },
      ]},
    { first: "Luca", last: "Berger", dob: "2021-09-03", room: acorns, allergies: "", medical: "", status: "enrolled", rank: null, presentHours: 3.5,
      guardians: [{ name: "Anja Berger", relationship: "mother", phone: "+34 611 440 229", email: "anja.berger@example.com", pin: "1904", emergency: true }]},
    { first: "Sofía", last: "Almeida", dob: "2020-11-21", room: acorns, allergies: "Lactose", medical: "Lactose-free milk only", status: "enrolled", rank: null, presentHours: 5.1,
      guardians: [{ name: "Rui Almeida", relationship: "father", phone: "+34 655 018 332", email: "rui.almeida@example.com", pin: "3307", emergency: true }]},
    { first: "Mateo", last: "Ruiz", dob: "2021-01-30", room: acorns, allergies: "", medical: "Asthma inhaler as needed", status: "enrolled", rank: null,
      guardians: [{ name: "Elena Ruiz", relationship: "mother", phone: "+34 644 771 090", email: "elena.ruiz@example.com", pin: "7742", emergency: true }]},
    { first: "Aya", last: "Rahman", dob: "2019-06-18", room: maples, allergies: "Tree nuts", medical: "", status: "enrolled", rank: null, presentHours: 2.8,
      guardians: [
        { name: "Leila Rahman", relationship: "mother", phone: "+34 600 221 884", email: "leila.rahman@example.com", pin: "5518", emergency: true },
        { name: "Karim Rahman", relationship: "father", phone: "+34 600 221 885", email: "karim.rahman@example.com", pin: "5519" },
      ]},
    { first: "Noah", last: "Pellicer", dob: "2019-02-09", room: maples, allergies: "", medical: "", status: "enrolled", rank: null, presentHours: 4.6,
      guardians: [{ name: "Laia Pellicer", relationship: "mother", phone: "+34 678 441 002", email: "laia.pellicer@example.com", pin: "2201", emergency: true }]},
    { first: "Clara", last: "Voss", dob: "2018-12-02", room: maples, allergies: "Eggs", medical: "", status: "enrolled", rank: null, presentHours: 1.4,
      guardians: [{ name: "Greta Voss", relationship: "mother", phone: "+34 612 908 441", email: "greta.voss@example.com", pin: "9090", emergency: true }]},
    { first: "Hugo", last: "Sanz", dob: "2019-08-27", room: maples, allergies: "", medical: "", status: "enrolled", rank: null,
      guardians: [{ name: "Oriol Sanz", relationship: "father", phone: "+34 699 114 773", email: "oriol.sanz@example.com", pin: "1177", emergency: true }]},
    { first: "Amira", last: "Benali", dob: "2017-03-14", room: cedars, allergies: "", medical: "", status: "enrolled", rank: null, presentHours: 3.1,
      guardians: [{ name: "Yasmine Benali", relationship: "mother", phone: "+34 621 333 018", email: "yasmine.benali@example.com", pin: "6402", emergency: true }]},
    { first: "Leo", last: "Hart", dob: "2017-10-05", room: cedars, allergies: "Gluten", medical: "Celiac — kitchen card on file", status: "enrolled", rank: null, presentHours: 4.9,
      guardians: [{ name: "Owen Hart", relationship: "father", phone: "+34 666 880 214", email: "owen.hart@example.com", pin: "3141", emergency: true }]},
    { first: "Valentina", last: "Mora", dob: "2016-07-22", room: cedars, allergies: "", medical: "", status: "enrolled", rank: null,
      guardians: [{ name: "Camila Mora", relationship: "mother", phone: "+34 647 002 119", email: "camila.mora@example.com", pin: "8088", emergency: true }]},
    { first: "Jonas", last: "Klein", dob: "2016-01-19", room: cedars, allergies: "Bee stings", medical: "EpiPen labeled JK", status: "enrolled", rank: null, presentHours: 2.2,
      guardians: [{ name: "Nina Klein", relationship: "mother", phone: "+34 615 774 330", email: "nina.klein@example.com", pin: "1919", emergency: true }]},
    { first: "Mireia", last: "Costa", dob: "2021-05-08", room: acorns, allergies: "", medical: "", status: "waitlist", rank: 1,
      guardians: [{ name: "Joan Costa", relationship: "father", phone: "+34 630 441 900", email: "joan.costa@example.com", pin: "1001", emergency: true }]},
    { first: "Theo", last: "Lund", dob: "2020-08-11", room: maples, allergies: "", medical: "", status: "waitlist", rank: 2,
      guardians: [{ name: "Sigrid Lund", relationship: "mother", phone: "+34 609 218 447", email: "sigrid.lund@example.com", pin: "2002", emergency: true }]},
    { first: "Noa", last: "Ferrer", dob: "2018-04-29", room: cedars, allergies: "Strawberries", medical: "", status: "waitlist", rank: 3,
      guardians: [{ name: "Anna Ferrer", relationship: "mother", phone: "+34 688 019 225", email: "anna.ferrer@example.com", pin: "3003", emergency: true }]},
    { first: "Ibrahim", last: "Diallo", dob: "2019-12-16", room: maples, allergies: "", medical: "", status: "waitlist", rank: 4,
      guardians: [{ name: "Amina Diallo", relationship: "mother", phone: "+34 641 555 018", email: "amina.diallo@example.com", pin: "4004", emergency: true }]},
  ];

  const childIds: Record<string, string> = {};
  for (const kid of kids) {
    const childId = id();
    childIds[`${kid.first} ${kid.last}`] = childId;
    await sql(
      `insert into children (id, center_id, room_id, first_name, last_name, date_of_birth, allergies, medical_notes, status, waitlist_rank)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [childId, centerId, kid.room, kid.first, kid.last, kid.dob, kid.allergies, kid.medical, kid.status, kid.rank],
    );
    for (const g of kid.guardians) {
      await sql(
        `insert into guardians (id, child_id, center_id, name, relationship, phone, email, can_pickup, is_emergency, pickup_pin)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [id(), childId, centerId, g.name, g.relationship, g.phone, g.email, true, g.emergency ?? false, g.pin],
      );
    }
    if (kid.status === "enrolled" && kid.presentHours != null) {
      await sql(
        `insert into attendance (id, center_id, child_id, check_in_at, check_in_by) values ($1,$2,$3,$4,$5)`,
        [id(), centerId, childId, hoursAgo(kid.presentHours), director],
      );
    }
  }

  const ines = childIds["Inés Navarro"];
  const clara = childIds["Clara Voss"];
  const leo = childIds["Leo Hart"];
  await sql(
    `insert into incidents (id, center_id, child_id, reported_by, kind, severity, occurred_at, body, parent_notified)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id(), centerId, ines, director, "injury", "low", hoursAgo(1.2),
      "Scraped knee on the courtyard pavers during free play. Cleaned, plaster applied. Inés returned to Acorns after ten minutes.", true],
  );
  await sql(
    `insert into incidents (id, center_id, child_id, reported_by, kind, severity, occurred_at, body, parent_notified)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id(), centerId, clara, director, "behavior", "medium", hoursAgo(2.4),
      "Difficulty transitioning from outdoor play. Sat with lead teacher, then rejoined Maples for snack.", false],
  );
  const today = new Date().toISOString().slice(0, 10);
  await sql(
    `insert into daily_notes (id, center_id, child_id, author_id, note_date, meals, naps, mood, body)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id(), centerId, leo, userId, today, "Ate full lunch, skipped yogurt", "Quiet reading, no nap", "Focused",
      "Built a long marble run with Amira. Asked to take the gluten-free banana bread recipe home."],
  );
  const staff: [string, string, string][] = [
    [director, "director", "+34 600 100 200"],
    ["Núria Soler", "lead", "+34 600 100 201"],
    ["Daniel Okonkwo", "teacher", "+34 600 100 202"],
    ["Marta Puig", "teacher", "+34 600 100 203"],
    ["Alex Vidal", "floater", "+34 600 100 204"],
  ];
  for (const [i, person] of staff.entries()) {
    await sql(
      `insert into staff (id, center_id, user_id, name, role, phone, active) values ($1,$2,$3,$4,$5,$6,$7)`,
      [id(), centerId, i === 0 ? userId : null, person[0], person[1], person[2], true],
    );
  }
  return centerId;
}
