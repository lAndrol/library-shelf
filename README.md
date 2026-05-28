# Library Shelf

Desktop inventory for a 5×5 bookcase. **(0, 0)** is top-left. Selecting **Present book** logs:

`Coordinate (x, y) selected and pushed`

Real gantry / serial comes later.

## Run (no Rust required)

```bash
npm install
npm run dev
```

Open the URL shown (usually http://localhost:1420). Data is stored in the browser `localStorage`.

## Run as Tauri desktop app

Install [Rust](https://www.rust-lang.org/tools/install), **restart your terminal** (or Cursor), then:

```bash
npm run tauri dev
```

If `cargo` is not found (PATH not refreshed yet), use:

```bash
npm run tauri:dev
```

First run compiles Rust (~1–2 min); the **Library Shelf** window opens when ready.

## Build

```bash
npm run build          # web assets only
npm run tauri build    # needs Rust
```

## Docs

- [`docs/software-planning.md`](docs/software-planning.md)
- [`docs/library-project-planning.md`](docs/library-project-planning.md)
