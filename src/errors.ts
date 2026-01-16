export class AuthorizationError extends Error {
  public readonly code = "E_FORBIDDEN";
  public readonly action: string;
  public readonly reason?: string;

  constructor(action: string, reason?: string) {
    super(reason ?? "Access denied");
    this.action = action;
    this.reason = reason;
  }
}
