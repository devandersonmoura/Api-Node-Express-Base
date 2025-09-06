const request = require("supertest");

let app;

beforeAll(() => {
  // Lazy require to use the same app exported
  app = require("../../src/index").app || require("../../src/index");
});

describe("basic integration", () => {
  test("health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  test("users requires auth", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  test("login validation fails on empty", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect([400, 422]).toContain(res.status);
  });
  test("login com credenciais válidas retorna token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "string@gmail.com", password: "ninonino" })
      .expect(200);

    expect(res.body).toHaveProperty("data.accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
    expect(res.body.data.user).toMatchObject({
      email: "string@gmail.com",
      name: "ninonino",
    });
  });
});
