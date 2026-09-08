import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Api } from "../api";

@Component({
  selector: "th-roster",
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-5xl p-5">
      <h1 class="font-display text-4xl">Roster</h1>
      <ul class="mt-5 grid gap-3 sm:grid-cols-2">
        @for (child of kids(); track child.id) {
          <li>
            <a [routerLink]="['/app/child', child.id]" class="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
              <span>
                <span class="block font-medium">{{ child.first_name }} {{ child.last_name }}</span>
                <span class="text-sm text-muted">{{ child.room_name }}</span>
              </span>
              <span class="text-xs">{{ child.present ? "In" : "Out" }}</span>
            </a>
          </li>
        }
      </ul>
    </div>
  `,
})
export class RosterPage {
  private api = inject(Api);
  kids = signal<any[]>([]);
  constructor() {
    this.api.children("enrolled").then((rows) => this.kids.set(rows));
  }
}
