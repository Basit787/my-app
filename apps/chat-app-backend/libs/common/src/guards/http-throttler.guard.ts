import { Injectable, type ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

// Rate limits REST routes only; socket events keep flowing during calls and chats
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  override canActivate(context: ExecutionContext): Promise<boolean> {
    return context.getType() === "http" ? super.canActivate(context) : Promise.resolve(true);
  }
}
