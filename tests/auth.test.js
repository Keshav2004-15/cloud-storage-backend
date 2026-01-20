import request from "supertest";
import app from "../src/index.js";

describe("Authentication API", () => {
  it("should login user and return JWT", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "test@mail.com",
        password: "test123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
