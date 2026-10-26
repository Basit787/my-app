import { Test, type TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";

// Boots the whole app, so PostgreSQL must be reachable (DATABASE_URL)
describe("Auth (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  it("/api/auth/me (GET) needs a token", () => {
    return request(app.getHttpServer()).get("/api/auth/me").expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
