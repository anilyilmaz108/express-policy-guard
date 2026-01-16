import { AuthorizationContext } from "./types";
import { Request } from "express";

let contextBuilder: (req: Request) => AuthorizationContext = (req) => ({
  user: (req as any).user,
  params: req.params,
  body: req.body,
  query: req.query,
  headers: req.headers
});

export function setContext(
  builder: (req: Request) => AuthorizationContext
) {
  contextBuilder = builder;
}

export function buildContext(req: Request): AuthorizationContext {
  return contextBuilder(req);
}
