import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { DeskModule } from "./desk/desk.module.js";

@Module({
  imports: [AuthModule, DeskModule],
})
export class AppModule {}
