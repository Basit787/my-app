import { corsOriginCallback, type AppConfig } from "@app/common";
import type { INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import type { Server, ServerOptions } from "socket.io";
import { verifyAccessToken } from "backend-common";

// Socket.IO with the same CORS rules as HTTP, and a handshake that must carry a valid access token (auth.token)
export class AuthenticatedIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly config: AppConfig,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: Partial<ServerOptions>): Server {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: { origin: corsOriginCallback(this.config), credentials: true },
    } as ServerOptions);
    server.use((socket, next) => {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) return next(new Error("Unauthorized"));
      verifyAccessToken(token)
        .then((user) => {
          if (!user) return next(new Error("Unauthorized"));
          socket.data.user = user;
          next();
        })
        .catch((error: unknown) =>
          next(new Error(error instanceof Error ? error.message : "Socket authentication failed")),
        );
    });
    return server;
  }
}
