import { Test, type TestingModule } from "@nestjs/testing";
import { CallsGateway } from "./calls.gateway.js";
import { CallsService } from "./calls.service.js";
import { CallSessionService } from "./call-session.service.js";
import { GroupCallService } from "./group-call.service.js";
import { GroupsService } from "../groups/groups.service.js";
import { RoomAccessService } from "../groups/room-access.service.js";
import { RealtimeService } from "@app/realtime";
import { NotificationsService } from "@app/notifications";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("CallsGateway", () => {
  let callsGateway: CallsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsGateway,
        { provide: CallsService, useValue: {} },
        { provide: CallSessionService, useValue: {} },
        { provide: GroupCallService, useValue: {} },
        { provide: GroupsService, useValue: {} },
        { provide: RoomAccessService, useValue: {} },
        { provide: RealtimeService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    callsGateway = module.get<CallsGateway>(CallsGateway);
  });

  it("should be defined", () => {
    expect(callsGateway).toBeDefined();
  });
});
