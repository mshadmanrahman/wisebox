## Wisebox Frontend (Next.js)

This app runs the local Wisebox UI (marketing + portal).

### Local Run

```bash
# from repo root
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
nvm install 22
nvm use 22

cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:3000` (marketing)
- `http://localhost:3000/login` (auth entry)
- `http://localhost:3000/dashboard` (authenticated portal)

### Node Version Guard

The frontend enforces `Node >=20 and <24` to avoid unstable dev runtime behavior with Next.js 14.

If you hit a version error:

```bash
nvm use 22
```

### Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```
