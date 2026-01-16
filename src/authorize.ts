import { Request, Response, NextFunction } from "express";
import { policy } from "./policy";
import { buildContext } from "./context";
import { AuthorizationError } from "./errors";
import { PolicyResult } from "./types";

export function authorize(action: string) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const policyFn = policy.get(action);

    if (!policyFn) {
      return next(
        new AuthorizationError(
          action,
          `No policy defined for action "${action}"`
        )
      );
    }

    try {
      const ctx = buildContext(req);
      const result: PolicyResult = await policyFn(ctx);

      const allowed =
        typeof result === "boolean" ? result : result.allow;

      if (!allowed) {
        const reason =
          typeof result === "object" ? result.reason : undefined;

        return next(new AuthorizationError(action, reason));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
