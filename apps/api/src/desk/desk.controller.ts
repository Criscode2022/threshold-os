import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import type { User } from "../auth/auth.service.js";
import { DeskService } from "./desk.service.js";

type Authed = Request & { user: User };

@Controller()
@UseGuards(AuthGuard)
export class DeskController {
  constructor(private readonly desk: DeskService) {}

  @Get("center")
  center(@Req() req: Authed) {
    return this.desk.me(req.user.id);
  }

  @Post("center")
  create(@Req() req: Authed, @Body() body: { name: string; licenseNo?: string; address?: string; directorName: string }) {
    return this.desk.create(req.user.id, body);
  }

  @Post("center/sample")
  sample(@Req() req: Authed, @Body() body: { displayName?: string }) {
    return this.desk.sample(req.user.id, body.displayName || req.user.name);
  }

  @Patch("center")
  update(@Req() req: Authed, @Body() body: { name: string; licenseNo: string; address: string }) {
    return this.desk.updateCenter(req.user.id, body);
  }

  @Get("dashboard")
  dashboard(@Req() req: Authed) {
    return this.desk.dashboard(req.user.id);
  }

  @Get("rooms")
  rooms(@Req() req: Authed) {
    return this.desk.rooms(req.user.id);
  }

  @Get("children")
  children(@Req() req: Authed, @Query("status") status?: string) {
    return this.desk.children(req.user.id, status || "enrolled");
  }

  @Post("children")
  addChild(@Req() req: Authed, @Body() body: Parameters<DeskService["addChild"]>[1]) {
    return this.desk.addChild(req.user.id, body);
  }

  @Get("children/:id")
  child(@Req() req: Authed, @Param("id") id: string) {
    return this.desk.child(req.user.id, id);
  }

  @Post("children/:id/check-in")
  checkIn(@Req() req: Authed, @Param("id") id: string) {
    return this.desk.checkIn(req.user.id, id);
  }

  @Post("children/:id/check-out")
  checkOut(@Req() req: Authed, @Param("id") id: string, @Body() body: { pin: string }) {
    return this.desk.checkOut(req.user.id, id, body.pin);
  }

  @Post("children/:id/enroll")
  enroll(@Req() req: Authed, @Param("id") id: string) {
    return this.desk.enroll(req.user.id, id);
  }

  @Get("attendance")
  attendance(@Req() req: Authed) {
    return this.desk.attendance(req.user.id);
  }

  @Get("incidents")
  incidents(@Req() req: Authed) {
    return this.desk.incidents(req.user.id);
  }

  @Post("incidents")
  addIncident(@Req() req: Authed, @Body() body: { childId: string; kind: string; severity: string; text: string; parentNotified?: boolean }) {
    return this.desk.addIncident(req.user.id, body);
  }

  @Post("incidents/:id/notify")
  notify(@Req() req: Authed, @Param("id") id: string) {
    return this.desk.notify(req.user.id, id);
  }

  @Get("notes")
  notes(@Req() req: Authed) {
    return this.desk.notes(req.user.id);
  }

  @Post("notes")
  addNote(@Req() req: Authed, @Body() body: { childId: string; meals?: string; naps?: string; mood?: string; text: string }) {
    return this.desk.addNote(req.user.id, body);
  }

  @Get("staff")
  staff(@Req() req: Authed) {
    return this.desk.staff(req.user.id);
  }

  @Post("staff")
  addStaff(@Req() req: Authed, @Body() body: { name: string; role: string; phone?: string }) {
    return this.desk.addStaff(req.user.id, body);
  }
}
