import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DeskController } from "./desk.controller.js";
import { DeskService } from "./desk.service.js";

@Module({
  imports: [AuthModule],
  controllers: [DeskController],
  providers: [DeskService],
})
export class DeskModule {}
