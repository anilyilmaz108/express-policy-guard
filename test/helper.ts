import express from "express";
import { authorize, setContext } from "../src";

export function createApp() {
  const app = express();

  app.use(express.json());

  // fake auth
  app.use((req, _res, next) => {
    (req as any).user = { id: 1, role: "user" };
    next();
  });

  setContext((req) => ({
    user: (req as any).user,
    params: req.params
  }));

  return { app };
}
