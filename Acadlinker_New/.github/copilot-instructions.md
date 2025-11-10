## Quick orientation — what this repo is

- Monorepo with two main parts:
  - `server/` — Flask backend (app factory in `server/app/__init__.py`, models in `server/app/models.py`). Uses SQLAlchemy, Flask-Migrate, Flask-Login and optional Cloudinary for uploads.
  - `client/` — React + Vite frontend (entry in `client/src`, API helpers in `client/src/api/`). Uses Vite dev server and `npm` scripts in `client/package.json`.

## High-level architecture and data flow (short)

- Backend: factory `create_app()` registers Blueprints. Key API prefixes:
  - `/api/auth` — authentication endpoints (`server/app/auth/routes.py`)
  - `/api/profile` — profile endpoints (`server/app/profile/routes.py`)
  - `/api/*` generally for REST endpoints; see `create_app()` in `server/app/__init__.py` for registrations.
- Frontend: client calls backend using relative API roots (examples in `client/src/api/auth.js`). The auth client uses fetch with `credentials: 'include'` so the app expects cookie-based sessions by default.

## Concrete developer workflows (Windows / cmd.EXE)

- Start backend (quick):
  1. Open a terminal in `server\`
   {cd c:\Users\rautn\Downloads\Acadlinker_NPAI-main\Acadlinker_NPAI-main\server}
  2. Create/activate venv and install deps:
     - python -m venv venv
     - venv\Scripts\activate
     - pip install -r requirements.txt
  3. Run app directly (dev):
     - python run.py

- Database migrations (Flask-Migrate):
  - set FLASK_APP=run.py
  - venv\Scripts\activate
  - flask db migrate -m "message"
  - flask db upgrade
  (A `migrations/` directory already exists in the repo.)

- Start frontend (client):
  - cd client
  - npm install
  - npm run dev   -> runs Vite dev server (see `client/package.json` scripts)

## Important config & environment points

- See `server/config.py` — default DB is sqlite (`sqlite:///site.db`). Environment vars supported:
  - `SECRET_KEY`, `CLOUDINARY_*` (when `UPLOAD_PROVIDER=cloudinary`), and `UPLOAD_PROVIDER` (default `local`).
- The backend initializes Cloudinary only when `UPLOAD_PROVIDER` is set to `cloudinary` in environment.

## Project-specific patterns / conventions to follow

- API-first JSON endpoints: routes in `server/app/*/routes.py` return JSON and explicit HTTP status codes. Example: `server/app/auth/routes.py` returns 201 on create, 401 on unauthorized, 409 for duplicate email.
- Manual serialization for models: `serialize_user()` in `auth/routes.py` shows the lightweight pattern used instead of a library like Marshmallow. Do not return password hashes.
- Blueprints are the primary organizing unit—add new APIs by creating a blueprint in `server/app/<area>/routes.py` and registering it in `create_app()`.
- Frontend API helpers use a small wrapper pattern (see `client/src/api/auth.js`) that returns { ok, status, data } and logs requests/responses — follow this style for other services.

## Integration and cross-component notes (gotchas)

- Cookie-based sessions: client uses `credentials: 'include'`; if frontend runs on a different port/origin during development, enable/verify CORS and correct cookie settings on the backend. The repo includes `Flask-CORS` in requirements but CORS initialization may be missing — check and add if running cross-origin.
- Both `axios` and `fetch` exist in the client deps; current auth helper uses `fetch`. Prefer the existing helper pattern for consistent responses.
- File uploads: backend can store file names locally or use Cloudinary. To enable Cloudinary, export the three `CLOUDINARY_*` env vars and set `UPLOAD_PROVIDER=cloudinary`.

## Files to inspect for quick edits or debugging

- Backend entry and wiring: `server/run.py`, `server/app/__init__.py`
- Models and user loader: `server/app/models.py` (look for `load_user` and `User` model fields)
- Auth API: `server/app/auth/routes.py` and client counterpart `client/src/api/auth.js`
- Migrations: `server/migrations/` (Flask-Migrate)
- Frontend entry and scripts: `client/package.json`, `client/src/main.jsx`, `client/src/components/`

## Examples to copy/paste

- Start server (cmd.exe):
  - cd server
  - python -m venv venv
  - venv\Scripts\activate
  - pip install -r requirements.txt
  - python run.py

- Start client (cmd.exe):
  - cd client
  - npm install
  - npm run dev

## When you need to change APIs

- Add a new blueprint in `server/app/<feature>/routes.py`, register it in `create_app()` (no URL prefix if serving root, otherwise use `/api/<feature>`), and update the frontend helper to call the new endpoints under `/api/<feature>`.

---
If anything above is unclear or you want more detail about CI, linting, or test commands, tell me which area to expand and I will update this file accordingly.
