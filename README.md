# C21 — NeoBank Playwright Tests

This repository contains Playwright tests for a minimal banking demo (NeoBank).

## What I added
- Allure integration via `allure-playwright` configured in `playwright.config.ts`.
  - Allure results will be written to `allure-results`.
- npm scripts in `package.json` to run tests and generate/serve Allure reports.
- This `README.md` with steps to run tests and view Allure reports on Windows PowerShell.

## Prerequisites
- Node.js (LTS) installed.
- For Allure HTML reports you can either install the CLI globally or use the npm package `allure-commandline`.

## Install dependencies
Open PowerShell in the project root and run:

```powershell
npm install
# If you didn't add allure packages as devDependencies yet, run:
npm install --save-dev allure-playwright allure-commandline
```

> Note: The project `package.json` in this repo already contains `allure-playwright` and `allure-commandline` as devDependencies. Run `npm install` to get them.

## Generate test results
Run the Playwright tests (produces `allure-results`):

```powershell
npm run test
```

Or run a single spec:

```powershell
npx playwright test tests/banking.spec.ts
```

## Serve the Allure report (quick)
This command uses the Allure CLI to serve a temporary HTML report from `allure-results`:

```powershell
npm run allure:serve
```

This will open a browser window with the Allure report.

## Generate a static Allure report directory
If you want a persistent HTML site in `allure-report`:

```powershell
npm run test:allure
# then open the folder:
explorer .\allure-report
```

## Notes
- If `npx allure` is not found, ensure `allure-commandline` is installed locally (`node_modules/.bin/allure`) or install Allure CLI system-wide (e.g., via Scoop or Chocolatey on Windows) and add it to PATH.
- If you prefer a different output folder, update `playwright.config.ts` reporter options.

If you want, I can also:
- Add a lightweight script to automatically open the generated `allure-report` folder.
- Add a CI job configuration to publish Allure results.

