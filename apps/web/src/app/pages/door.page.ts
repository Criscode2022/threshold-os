import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api } from "../api";

@Component({
  selector: "th-door",
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-5xl p-5">
      <h1 class="font-display text-4xl">Door</h1>
      <p class="mt-1 text-sm text-muted">Check-in, then release only with an authorized adult PIN.</p>
      @if (message()) { <p class="mt-3 text-sm">{{ message() }}</p> }
      <ul class="mt-5 grid gap-3">
        @for (child of kids(); track child.id) {
          <li class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ child.first_name }} {{ child.last_name }}</p>
              <p class="text-sm text-muted">{{ child.room_name }}</p>
            </div>
            @if (child.present) {
              <input class="min-h-11 w-28 rounded-md border border-line px-3" placeholder="PIN" [(ngModel)]="pins[child.id]" />
              <button class="min-h-11 rounded-md bg-accent px-4 text-sm text-accent-fg" (click)="out(child)">Release</button>
            } @else {
              <button class="min-h-11 rounded-md border border-line px-4 text-sm" (click)="inn(child)">Check in</button>
            }
          </li>
        }
      </ul>
    </div>
  `,
})
export class DoorPage {
  private api = inject(Api);
  kids = signal<any[]>([]);
  pins: Record<string, string> = {};
  message = signal<string | null>(null);

  constructor() {
    this.reload();
  }
  async reload() {
    this.kids.set(await this.api.children("enrolled"));
  }
  async inn(child: any) {
    await this.api.checkIn(child.id);
    this.message.set(`${child.first_name} is signed in`);
    await this.reload();
  }
  async out(child: any) {
    try {
      const result = await this.api.checkOut(child.id, this.pins[child.id] || "");
      this.message.set(`Released ${child.first_name} to ${result.guardian}`);
      await this.reload();
    } catch {
      this.message.set("PIN does not match an authorized adult");
    }
  }
}
