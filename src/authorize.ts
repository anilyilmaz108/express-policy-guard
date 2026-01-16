import { Request, Response, NextFunction } from "express";
import { policy } from "./policy";
import { buildContext } from "./context";
import { AuthorizationError } from "./errors";
import { PolicyResult, AuthorizeOptions } from "./types";

export function authorize(
  action: string,
  options: AuthorizeOptions = {}
) {
  return async function (
    req: Request,
    _res: Response,
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

      // Global policy
      const policyResult: PolicyResult = await policyFn(ctx);

      const policyAllowed =
        typeof policyResult === "boolean"
          ? policyResult
          : policyResult.allow;

      if (!policyAllowed) {
        const reason =
          typeof policyResult === "object"
            ? policyResult.reason
            : undefined;

        return next(
          new AuthorizationError(
            action,
            options.explain ? reason : undefined
          )
        );
      }

      // Inline condition (when)
      if (options.when) {
        const whenResult = await options.when(ctx);

        const whenAllowed =
          typeof whenResult === "boolean"
            ? whenResult
            : whenResult.allow;

        if (!whenAllowed) {
          const reason =
            typeof whenResult === "object"
              ? whenResult.reason
              : undefined;

          return next(
            new AuthorizationError(
              action,
              options.explain ? reason : undefined
            )
          );
        }
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
