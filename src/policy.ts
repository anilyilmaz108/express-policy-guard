import { PolicyFn } from "./types";

const registry = new Map<string, PolicyFn>();

export const policy = {
  define(action: string, fn: PolicyFn) {
    registry.set(action, fn);
  },

  get(action: string): PolicyFn | undefined {
    return registry.get(action);
  }
};
