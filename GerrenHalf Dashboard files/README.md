# GerrenHalf Dashboard Files

Upload this folder to GitHub as the dashboard repo.

## Included

- Clean GerrenHalt dashboard source only
- No old Jarvis pages, hooks, or components
- GitHub Pages workflow included

## Required GitHub Repository Variables

- `VITE_API_BASE_URL=https://your-katabump-domain.example`
- `VITE_ROUTER_MODE=hash`
- `VITE_APP_BASE_PATH=/your-repo/`

## Local Commands

```bash
npm install
npm run build
```

## GitHub Pages

1. Push this folder as its own repository.
2. In GitHub, enable `Pages -> GitHub Actions`.
3. Add the repository variables listed above.
4. Push to `main`.

The dashboard will authenticate against your Katabump backend and use Neon through that backend.
