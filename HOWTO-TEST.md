#How To Test

## Unit Test
Run the following commands to run all unit tests in /tests/unit folder.
```bash
npm run test:unit #defined in scripts section in package.json
```

To see the unit test coverage, run the following command.
```bash
npm run test:unit:coverage #defined in scripts section in package.json
```
See the vitest config in vitest.config.ts for customization.

## E2E Test
Before running e2e tests, you need to run the app. Run the app in a terminal.
```bash
npm run dev
```

Then run the following command to run all e2e tests in /tests/e2e folder, in a new terminal.
```bash
npm run test:e2e #defined in scripts section in package.json
```

See the playwright config in playwright.config.ts for customization.
