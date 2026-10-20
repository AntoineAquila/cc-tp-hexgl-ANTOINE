---
name: run-hexgl
description: Run, start, serve or screenshot HexGL (static WebGL racing game) with Node.js and drive it in a browser. Use to launch the app and click through menu -> race.
---

HexGL is a static site (no package.json, no build). Serve it with Node, drive it with the Playwright MCP browser tools. Paths are relative to `HexGL/`. Verified on Windows 11, Node 24, Git Bash.

## Serve (agent path)

```bash
npx --yes http-server . -p 8080 -c-1 > srv.log 2>&1 &
sleep 8; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/
```

Expect `200`. Use `run_in_background` for the first line. Stop it by killing the node process on port 8080.

## Drive (Playwright MCP tools, in order)

1. `browser_navigate` -> `http://localhost:8080/` (menu with START / CONTROLS / QUALITY / HUD / CREDITS).
2. `browser_click` target `#start` -> controls screen ("CLICK/TOUCH TO CONTINUE").
3. `browser_click` target `#step-2` -> game loads; then `browser_wait_for` ~10s.
4. `browser_take_screenshot` -> ship on the track, "GET READY", lap counter 1/3.

## Gotchas

- Click by CSS id (`#start`, `#step-2`). `text=START` fails: the label is rendered "Start" and uppercased by CSS.
- After a failed click the page sat on `about:blank`; re-navigate before retrying.
- Screenshots reflect the moment the call runs; wait for the race start before judging a blank/black frame.
- Console shows ~10 WebGL/Three.js warnings and 0 errors: normal.
- Not verified: the QUnit tests in `formation/tests/`, keyboard driving during the race.
- No `chromium-cli` on this machine; the MCP browser tools are the driver (no script file to commit).
