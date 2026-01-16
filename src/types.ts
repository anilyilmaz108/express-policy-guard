export type Decision = "allow" | "deny";

export interface AuthorizationContext {
  user?: any;
  params?: any;
  body?: any;
  query?: any;
  headers?: any;
}

export type PolicyResult =
  | boolean
  | {
      allow: boolean;
      reason?: string;
    };

export type PolicyFn = (
  ctx: AuthorizationContext
) => PolicyResult | Promise<PolicyResult>;
