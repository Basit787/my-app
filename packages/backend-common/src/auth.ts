import {
  createParamDecorator,
  Inject,
  Injectable,
  Module,
  SetMetadata,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { jwtVerify, SignJWT } from "jose";
import type { IncomingMessage } from "node:http";

export type Role = "user" | "admin";

// The user behind a verified access token (claims sub, name, role)
export interface AuthUser {
  id: string;
  role: Role;
  username: string;
}

// The HTTP request after the guard: Node's request plus the signed-in user
export type AuthenticatedRequest = IncomingMessage & { user?: AuthUser };

// HS256 key from JWT_SECRET: the auth service signs with it, every backend verifies with it
const jwtKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("JWT_SECRET is required in production");
  return new TextEncoder().encode(secret || "dev-secret-change-me");
};

// A JWT for `user`, valid for `ttlSeconds`; only the auth service calls this
export const signAccessToken = async (user: AuthUser & { email: string }, ttlSeconds: number) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const token = await new SignJWT({ name: user.username, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(jwtKey());
  return { token, expiresAt };
};

// The user behind a valid token; null when the signature is wrong, the token expired or it is malformed
export const verifyAccessToken = async (token: string): Promise<AuthUser | null> => {
  try {
    const { payload } = await jwtVerify<{ name?: string; role?: string }>(token, jwtKey(), { algorithms: ["HS256"] });
    if (!payload.sub || !payload.name) return null;
    return { id: payload.sub, role: payload.role === "admin" ? "admin" : "user", username: payload.name };
  } catch {
    return null;
  }
};

// The token from "Authorization: Bearer <token>", or null
export const bearerToken = (authorization: string | undefined): string | null => {
  const [scheme, token] = authorization?.split(" ") ?? [];
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
};

export const IS_PUBLIC = "isPublic";

// Lets a route through without a token
export const Public = () => SetMetadata(IS_PUBLIC, true);

// The user the guard read from the token
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user!,
);

// Every HTTP route needs a valid bearer token unless marked @Public()
@Injectable()
export class AuthGuard implements CanActivate {
  // Explicit token: this package is built without decorator metadata
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "http") return true;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request.headers.authorization);
    const user = token ? await verifyAccessToken(token) : null;
    if (!user) throw new UnauthorizedException("Authentication required");
    request.user = user;
    return true;
  }
}

// Import once in an app's root module to protect every route with AuthGuard
@Module({ providers: [{ provide: APP_GUARD, useClass: AuthGuard }] })
export class JwtAuthModule {}
