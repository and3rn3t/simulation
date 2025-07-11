# Development Workflow Guide

This guide helps Copilot understand the development workflow and provide better assistance.

## Project Setup Checklist

When starting development:

1. **Environment Setup**

   ```powershell
   npm install
   npm run env:check
   ```

2. **Development Server**

   ```powershell
   npm run dev
   ```

3. **Run Tests**

   ```powershell
   npm run test
   npm run test:e2e
   ```

## Feature Development Workflow

### 1. Planning Phase

- Check existing features in `src/features/`
- Review organism types in `src/models/organismTypes.ts`
- Check UI components in `src/ui/components/`

### 2. Implementation Phase

- Follow TypeScript patterns from existing code
- Use error handling templates from copilot-instructions.md
- Implement tests alongside code
- Use object pooling for performance-critical objects

### 3. Testing Phase

- Unit tests: `npm run test`
- Integration tests: Check `test/integration/`
- E2E tests: `npm run test:e2e`
- Performance tests: `npm run test:performance`

### 4. Quality Assurance

- Type checking: `npm run type-check`
- Linting: `npm run lint:fix`
- Formatting: `npm run format`
- Full quality check: `npm run quality:check`

## Code Review Guidelines

### What to Check

- [ ] TypeScript types are properly defined
- [ ] Error handling follows project patterns
- [ ] Canvas operations have proper context checks
- [ ] Memory management uses object pooling where appropriate
- [ ] Tests cover new functionality
- [ ] Performance implications are considered
- [ ] Touch events are handled for mobile compatibility

### Performance Considerations

- [ ] Large populations (>500 organisms) perform well
- [ ] Memory usage is monitored
- [ ] Canvas rendering is optimized
- [ ] Object pooling is used for frequently created objects

## Common Development Tasks

### Adding a New Organism Type

1. **Define the type** in `src/models/organismTypes.ts`:

   ```typescript
   export const NEW_ORGANISM: OrganismType = {
     name: 'New Type',
     color: '#COLOR',
     growthRate: 0.0,
     deathRate: 0.0,
     maxAge: 100,
     size: 5,
     description: 'Description',
   };
   ```

2. **Add to ORGANISM_TYPES** object
3. **Update UI** to include new type in selection
4. **Add tests** for the new organism type
5. **Test performance** with the new type

### Adding a New UI Component

1. **Create component** in `src/ui/components/`
2. **Follow component pattern** from existing components
3. **Add error handling** for DOM operations
4. **Include in main UI** setup
5. **Add tests** with proper DOM mocking

### Optimizing Performance

1. **Profile the issue**:

   ```typescript
   perf.start('operation');
   // ... code ...
   perf.end('operation');
   ```

2. **Check memory usage**:

   ```typescript
   const stats = simulation.getMemoryStats();
   ```

3. **Consider optimizations**:
   - Object pooling for frequently created objects
   - Spatial partitioning for collision detection
   - Batch processing for large datasets
   - Web Workers for heavy computation

### Debugging Canvas Issues

1. **Check context validity**:

   ```typescript
   if (!ctx) {
     throw new CanvasError('Canvas context required');
   }
   ```

2. **Use browser dev tools**:
   - Performance tab for rendering issues
   - Memory tab for memory leaks
   - Console for error messages

3. **Test on mobile devices** for touch event issues

## Git Workflow

### Branch Naming

- `feature/organism-type-bacteria`
- `fix/canvas-rendering-issue`
- `perf/object-pooling-optimization`
- `test/integration-simulation-tests`

### Commit Messages

Follow conventional commits:

- `feat: add new organism type with unique behavior`
- `fix: resolve canvas context null reference`
- `perf: implement object pooling for organisms`
- `test: add integration tests for simulation core`
- `docs: update copilot instructions with new patterns`

## Deployment Checklist

### Pre-deployment

- [ ] All tests pass: `npm run test && npm run test:e2e`
- [ ] Quality checks pass: `npm run quality:check`
- [ ] Build succeeds: `npm run build:safe`
- [ ] Preview works: `npm run preview`
- [ ] Performance tested with large populations
- [ ] Mobile compatibility verified

### Staging Deployment

```powershell
npm run deploy:staging:dry  # Dry run first
npm run deploy:staging      # Actual deployment
npm run staging:test        # Test deployment
```

### Production Deployment

```powershell
npm run deploy:production:dry  # Dry run first
npm run deploy:production      # Actual deployment
npm run monitor:production     # Monitor deployment
```

## Troubleshooting Common Issues

### TypeScript Errors

1. Run `npm run type-check` to see all errors
2. Check import paths use project aliases (`@/`)
3. Ensure all types are properly exported
4. Use `npm run build:safe` for comprehensive checking

### Canvas Issues

1. Verify canvas element exists in DOM
2. Check getContext('2d') returns valid context
3. Test on both desktop and mobile
4. Use browser dev tools Performance tab

### Memory Issues

1. Monitor with `simulation.getMemoryStats()`
2. Check object pooling is being used
3. Look for memory leaks in dev tools
4. Test with large populations (>1000 organisms)

### Performance Issues

1. Profile with browser dev tools
2. Check if optimizations are enabled
3. Monitor memory usage patterns
4. Test spatial partitioning effectiveness

## Environment-Specific Notes

### Development

- Hot module replacement enabled
- Source maps available
- Error overlay active
- Performance monitoring optional

### Staging

- Production-like build
- Error tracking enabled
- Performance monitoring active
- A/B testing possible

### Production

- Optimized build
- Error tracking critical
- Performance monitoring required
- Monitoring and alerting active
