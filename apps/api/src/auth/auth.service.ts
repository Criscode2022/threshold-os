import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { sql } from "../db.js";

export type User = { id: string; email: string; name: string };

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async register(email: string, password: string, name: string): Promise<User> {
    const existing = await sql<{ id: string }>("select id from users where email = $1", [email.toLowerCase()]);
    if (existing[0]) throw new ConflictException("Email already registered");
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 12);
    await sql(
      "insert into users (id, email, password_hash, name) values ($1,$2,$3,$4)",
      [id, email.toLowerCase(), hash, name],
    );
    return { id, email: email.toLowerCase(), name };
  }

  async login(email: string, password: string): Promise<User> {
    const rows = await sql<{ id: string; email: string; name: string; password_hash: string }>(
      "select id, email, name, password_hash from users where email = $1",
      [email.toLowerCase()],
    );
    const user = rows[0];
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    return { id: user.id, email: user.email, name: user.name };
  }

  sign(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email, name: user.name });
  }

  async verify(token: string): Promise<User> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; name: string }>(token);
      return { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      throw new UnauthorizedException("Unauthorized");
    }
  }
}
