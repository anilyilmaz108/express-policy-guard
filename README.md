# express-policy-guard

Declarative, context-aware authorization middleware for Express.js.

`express-policy-guard` provides a clean and flexible way to define **authorization
policies** and protect Express routes using a **declarative and testable**
approach — without mixing access control logic into your controllers.

---

## Features

- ✅ Express-first authorization middleware
- ✅ Declarative policy definitions
- ✅ Context-aware access control (`user`, `params`, `body`, etc.)
- ✅ Async policy support
- ✅ Route-level inline conditions
- ✅ Explainable deny reasons
- ✅ TypeScript support out of the box
- ✅ Fully tested with Jest & Supertest
- ✅ Lightweight and minimal API

---

## Installation

```bash
npm install express-policy-guard
```

[!NOTE]
Requires Express >= 4

## Quick Start

```bash
import express from "express";
import { authorize, policy } from "express-policy-guard";

const app = express();

app.use(express.json());

// Fake authentication (example)
app.use((req, _res, next) => {
  req.user = { id: 1, role: "user" };
  next();
});

// Define a policy
policy.define("user.read", ({ user, params }) => {
  return user.role === "admin" || user.id === Number(params.id);
});

// Protect a route
app.get(
  "/users/:id",
  authorize("user.read"),
  (req, res) => {
    res.json({ ok: true });
  }
);

// Error handler (required)
app.use((err, _req, res, _next) => {
  if (err.code === "E_FORBIDDEN") {
    return res.status(403).json({
      error: err.code,
      action: err.action,
      reason: err.reason
    });
  }

  res.status(500).json({ error: "SERVER_ERROR" });
});

app.listen(3000);
```

## Usage

### 1- Define policies
Policies are functions that receive a context object and return:
- true / false
- or { allow: boolean, reason?: string }

```bash
policy.define("student.read", ({ user, params }) => ({
  allow: user.id === Number(params.id),
  reason: "Users can only read their own record"
}));
```

### 2- Protect routes

```bash
app.get(
  "/students/:id",
  authorize("student.read"),
  controller
);
```

### 3- Route-level conditions (when)
Add additional conditions directly at route level.

```bash
authorize("student.read", {
  when: ({ user, params }) => user.id === Number(params.id)
});
```

### 4- Explain mode
Enable explain mode to return human-readable deny reasons.

```bash
authorize("student.read", { explain: true });
```

Response example:

```bash
{
  "error": "E_FORBIDDEN",
  "action": "student.read",
  "reason": "Users can only read their own record"
}
```

## Context Customization
You can customize how the authorization context is built.

```bash
import { setContext } from "express-policy-guard";

setContext((req) => ({
  user: req.user,
  params: req.params,
  body: req.body
}));
```

## Error Handling
You must register an Express error middleware after all routes.

```bash
app.use((err, _req, res, _next) => {
  if (err.code === "E_FORBIDDEN") {
    return res.status(403).json({
      error: err.code,
      action: err.action,
      reason: err.reason
    });
  }

  res.status(500).json({ error: "SERVER_ERROR" });
});
```

## Testing
This package is fully tested using real Express application

```bash
npm test
```