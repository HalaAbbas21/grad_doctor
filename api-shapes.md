# API shape discovery — Doctor endpoints

**Status: could not be completed. The backend was unreachable from this environment.**

This file contains zero invented data. Per the instruction that an honest "unknown"
beats a confident guess, nothing below is inferred from the Postman collection or
mock data — this is a record of the connectivity attempt only.

## What was attempted

```
curl -s -X POST http://api.basma-unit.cloud:8080/api/auth/login \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"email":"rana@basma.org","password":"password"}'
```

This is as far as it got — the login call itself never returned a response, so no
token was obtained and none of the 14 downstream endpoints (`/patients`, `/queues`,
`/appointments`, `/consult-requests`, `/medical-templates`, `/laboratories`,
`/lab-test-requests`, `/lab-results`, `/notifications`, `/clinical-notes`,
`/patients/{id}/treatment-plans`, `/discharge-reports`, `/mar-items`) were called.

## Connectivity evidence

Tested from this shell, repeated across several attempts, with `curl -v`:

| Target | Result |
|---|---|
| `http://api.basma-unit.cloud:8080/api/auth/login` (POST, 20–45s timeout) | TCP connects (`Connected to api.basma-unit.cloud (185.170.196.96) port 8080`), request bytes sent, then either **`Operation timed out ... with 0 bytes received`** or **`Recv failure: Connection was reset`** — no HTTP response ever arrives. |
| `http://api.basma-unit.cloud:80/...` (same request, port 80) | Same pattern: TCP connects, then times out with 0 bytes received. |
| `https://www.google.com`, `http://example.com` (control, same shell, same run) | `200` in 1–4s, repeatedly. |
| DNS (`nslookup api.basma-unit.cloud`) | Resolves fine → `185.170.196.96`. |

So this isn't a blanket network outage in this environment — ordinary internet access
works normally in the same session. The failure is specific to `api.basma-unit.cloud`
on both ports tried: the TCP handshake succeeds but the HTTP layer never completes,
which looks like something between here and that host is dropping/resetting the
connection once actual data flows (a firewall/proxy rule keyed on the destination,
most likely), rather than the app server itself being down or slow.

This matches the same failure observed when this was last tried during the auth-wiring
task — it has not resolved on its own since.

## What this means for the task

- No token was obtained.
- No endpoint was called.
- No response shape, pagination envelope, or field list can be reported for any of
  the 15 endpoints — reporting anything here would mean inventing it, which was
  explicitly ruled out.

## Next step

This investigation needs to run from an environment that can actually reach
`api.basma-unit.cloud:8080` — e.g. your own machine, a CI runner with a route to it,
or wherever the Postman collection was originally exercised from. Once you have raw
responses (even just the login call), I can pick this discovery straight back up from
there, or you can paste the raw JSON here and I'll compile the shape report from that
instead of curling it myself.
