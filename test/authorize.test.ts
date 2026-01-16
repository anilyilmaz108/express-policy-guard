import supertest from "supertest";
import { authorize, policy } from "../src";
import { createApp } from "./helper";

describe("authorize middleware", () => {
  beforeEach(() => {
    (policy as any)._registry?.clear?.();
  });

  it("allows access when policy returns true", async () => {
    const { app } = createApp();

    policy.define("user.read", () => true);

    app.get("/users/:id", authorize("user.read"), (_req, res) => {
      res.status(200).json({ ok: true });
    });

    app.use((err: any, _req: any, res: any, _next: any) => {
      if (err.code === "E_FORBIDDEN") {
        return res.status(403).json(err);
      }
      res.status(500).json({ error: "SERVER_ERROR" });
    });

    await supertest(app).get("/users/1").expect(200);
  });

  it("denies access with 403", async () => {
    const { app } = createApp();

    policy.define("user.read", () => false);

    app.get("/users/:id", authorize("user.read"), (_req, res) => {
      res.json({ ok: true });
    });

    app.use((err: any, _req: any, res: any, _next: any) => {
      if (err.code === "E_FORBIDDEN") {
        return res.status(403).json(err);
      }
      res.status(500).json({ error: "SERVER_ERROR" });
    });

    await supertest(app).get("/users/1").expect(403);
  });

  it("returns explain reason when enabled", async () => {
    const { app } = createApp();

    policy.define("user.read", () => ({
      allow: false,
      reason: "Forbidden"
    }));

    app.get(
      "/users/:id",
      authorize("user.read", { explain: true }),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    app.use((err: any, _req: any, res: any, _next: any) => {
      if (err.code === "E_FORBIDDEN") {
        return res.status(403).json({
          action: err.action,
          reason: err.reason
        });
      }
      res.status(500).json({ error: "SERVER_ERROR" });
    });

    const res = await supertest(app).get("/users/1");

    expect(res.status).toBe(403);
    expect(res.body.reason).toBe("Forbidden");
  });

  it("supports async policies", async () => {
    const { app } = createApp();

    policy.define("user.read", async () => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(true), 10)
      );
    });

    app.get("/users/:id", authorize("user.read"), (_req, res) => {
      res.json({ ok: true });
    });

    app.use((err: any, _req: any, res: any, _next: any) => {
      if (err.code === "E_FORBIDDEN") {
        return res.status(403).json(err);
      }
      res.status(500).json({ error: "SERVER_ERROR" });
    });

    await supertest(app).get("/users/1").expect(200);
  });

  it("applies inline when condition", async () => {
    const { app } = createApp();

    policy.define("user.read", () => true);

    app.get(
      "/users/:id",
      authorize("user.read", {
        when: ({ user, params }) => user.id === Number(params.id)
      }),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    app.use((err: any, _req: any, res: any, _next: any) => {
      if (err.code === "E_FORBIDDEN") {
        return res.status(403).json(err);
      }
      res.status(500).json({ error: "SERVER_ERROR" });
    });

    await supertest(app).get("/users/1").expect(200);
    await supertest(app).get("/users/2").expect(403);
  });
});
