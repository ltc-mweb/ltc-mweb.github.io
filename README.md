# Litecoin MWEB Docs Web App

This repository contains a static docs web app for Litecoin's MWEB technical documentation.

## Local Preview

Because the app loads markdown files with `fetch`, run it from a local web server:

```powershell
# From this repo root:
python serve.py --port 8000
```

Then open `http://localhost:8000`.

This local server intentionally serves `404.html` for missing files so legacy routes
like `/kernels.md` are redirected to hash routes, matching GitHub Pages behavior.
`python -m http.server` does not do this.

## Deploy To GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, go to `Settings` -> `Pages`.
3. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your default branch)
   - `Folder`: `/ (root)`
4. Save and wait for deployment.
5. Your docs site will be available at:
   - User/org site repo: `https://<account>.github.io/`
   - Project repo: `https://<account>.github.io/<repo>/`

## App Structure

- `index.html`: app shell and layout
- `styles.css`: styling and responsive behavior
- `app.js`: markdown routing + rendering
- `docs/*.md`: source documentation pages
- `404.html`: redirects legacy `/*.md` URLs to hash routes (e.g. `/kernels.md` -> `/#/kernels`)
- `serve.py`: local dev server that emulates GitHub Pages custom 404 handling
