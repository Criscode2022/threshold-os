import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import { AuthGuard } from "./auth.guard.js";
import { AuthService, type User } from "./auth.service.js";

const creds = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(80),
  name: z.string().trim().min(2).max(80).optional(),
});

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setCookie(res: Response, token: string) {
    res.cookie("threshold_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  @Post("register")
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const data = creds.parse(body);
    const user = await this.auth.register(data.email, data.password, data.name || "Director");
    this.setCookie(res, this.auth.sign(user));
    return user;
  }

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const data = creds.parse(body);
    const user = await this.auth.login(data.email, data.password);
    this.setCookie(res, this.auth.sign(user));
    return user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("threshold_token", { path: "/" });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() req: Request & { user: User }) {
    return req.user;
  }
}
