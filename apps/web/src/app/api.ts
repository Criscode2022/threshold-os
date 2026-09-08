import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export type User = { id: string; email: string; name: string };

@Injectable({ providedIn: "root" })
export class Api {
  private http = inject(HttpClient);

  me() {
    return firstValueFrom(this.http.get<User>("/api/auth/me"));
  }
  register(body: { email: string; password: string; name: string }) {
    return firstValueFrom(this.http.post<User>("/api/auth/register", body));
  }
  login(body: { email: string; password: string }) {
    return firstValueFrom(this.http.post<User>("/api/auth/login", body));
  }
  logout() {
    return firstValueFrom(this.http.post("/api/auth/logout", {}));
  }
  dashboard() {
    return firstValueFrom(this.http.get<any>("/api/dashboard"));
  }
  sample(displayName: string) {
    return firstValueFrom(this.http.post("/api/center/sample", { displayName }));
  }
  createCenter(body: { name: string; directorName: string; licenseNo?: string; address?: string }) {
    return firstValueFrom(this.http.post("/api/center", body));
  }
  children(status = "enrolled") {
    return firstValueFrom(this.http.get<any[]>(`/api/children`, { params: { status } }));
  }
  child(id: string) {
    return firstValueFrom(this.http.get<any>(`/api/children/${id}`));
  }
  checkIn(id: string) {
    return firstValueFrom(this.http.post(`/api/children/${id}/check-in`, {}));
  }
  checkOut(id: string, pin: string) {
    return firstValueFrom(this.http.post<{ guardian: string }>(`/api/children/${id}/check-out`, { pin }));
  }
  incidents() {
    return firstValueFrom(this.http.get<any[]>("/api/incidents"));
  }
  addIncident(body: { childId: string; kind: string; severity: string; text: string }) {
    return firstValueFrom(this.http.post("/api/incidents", body));
  }
  enroll(id: string) {
    return firstValueFrom(this.http.post(`/api/children/${id}/enroll`, {}));
  }
  addChild(body: Record<string, unknown>) {
    return firstValueFrom(this.http.post("/api/children", body));
  }
}
