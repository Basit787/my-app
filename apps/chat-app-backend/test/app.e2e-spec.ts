import { Test, type TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";

// Boots the whole app, so MongoDB and MinIO must be reachable (MONGODB_URI, MINIO_ENDPOINT)
describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/contacts (GET) needs a token", () => {
    return request(app.getHttpServer()).get("/contacts").expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
