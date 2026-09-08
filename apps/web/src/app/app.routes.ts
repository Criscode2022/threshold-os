import { Routes } from "@angular/router";
import { LandingPage } from "./pages/landing.page";
import { LoginPage } from "./pages/login.page";
import { ShellPage } from "./pages/shell.page";
import { TodayPage } from "./pages/today.page";
import { DoorPage } from "./pages/door.page";
import { RosterPage } from "./pages/roster.page";
import { ChildPage } from "./pages/child.page";
import { IncidentsPage } from "./pages/incidents.page";
import { WaitlistPage } from "./pages/waitlist.page";

export const routes: Routes = [
  { path: "", component: LandingPage },
  { path: "login", component: LoginPage },
  {
    path: "app",
    component: ShellPage,
    children: [
      { path: "", component: TodayPage },
      { path: "door", component: DoorPage },
      { path: "roster", component: RosterPage },
      { path: "child/:id", component: ChildPage },
      { path: "incidents", component: IncidentsPage },
      { path: "waitlist", component: WaitlistPage },
    ],
  },
];
