# Code Analysis and Performance

## Code Analysis
### Static Code Analysis
Run below commands to see static code analysis.
```bash
npm run lint #eslint

npm run type-check #typescript
```


## Test Coverage
### Jest
Configure jest.config.ts
```bash
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/stories/**'
  ],
  coverageReporters: ['html', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```
Run
```bash
npm test -- --coverage --watchAll=false
```

### Visualize Coverage
after running test
```bash
# Install coverage visualization
npm install -g codecov

# After running tests
codecov -f ./coverage/lcov.info
```

## Performance & Optimization
### Lighthouse Audit
Use chrome lighthouse in chrome dev tools.
Or
Run this command in terminal
```bash
# first install lighthouse
npm install -g lighthouse
# then run analysis
lighthouse https://yourdomain.com/yoururl/ --view
```

## Security Check
```bash
npm audit
```

# Install Plato for visual analysis
npm install -g plato

# Generate report (adjust src path as needed)
plato -r -d ./report -t "My Project Analysis" ./src

# Install dependency-cruiser
npm install -g dependency-cruiser

# Generate dependency graph
depcruise --output-type dot src | dot -T svg > dependency-graph.svg

# Check for circular dependencies
depcruise --validate .dependency-cruiser.json src