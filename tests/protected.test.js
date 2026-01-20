import request from "supertest";
import app from "../src/index.js";

describe("Protected Route", () => {
  it("should block unauthenticated access", async () => {
    const res = await request(app).get("/protected");
    expect(res.statusCode).toBe(401);
  });
});
