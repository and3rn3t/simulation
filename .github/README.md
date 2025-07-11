# GitHub Copilot Configuration for Simulation Project

This directory contains GitHub Copilot-specific configuration files to enhance the development experience.

## Files Overview

### 📋 Core Instructions

- **`copilot-instructions.md`** - Main Copilot instructions with project patterns, error handling, and best practices
- **`COPILOT_CHAT_PARTICIPANTS.md`** - Guide for using Copilot Chat effectively with workspace commands
- **`COPILOT_SNIPPETS.md`** - Code templates and common snippets for rapid development
- **`DEVELOPMENT_WORKFLOW.md`** - Step-by-step workflow guide for feature development

## Quick Start for Copilot

### Essential Commands

```powershell
# Start development
npm run dev

# Run tests
npm run test

# Quality check
npm run quality:check
```

### Most Useful Copilot Chat Commands

- `@workspace /explain` - Understand project structure
- `@workspace How do I add a new organism type?`
- `@workspace Show me error handling patterns`
- `@workspace Help with canvas operations`

### Key Project Patterns

1. **Error Handling**: Always use `ErrorHandler.getInstance().handleError()`
2. **Canvas Operations**: Check context validity before drawing
3. **Memory Management**: Use object pooling for organisms
4. **Testing**: Mock canvas context and DOM elements
5. **TypeScript**: Use interfaces from `src/models/`

## VS Code Settings

The `.vscode/settings.json` file is optimized for:

- Enhanced Copilot integration
- TypeScript development
- Canvas debugging
- Testing with Vitest
- Better project navigation

## Development Tips

### Getting Better Suggestions

1. Use descriptive variable names
2. Include JSDoc comments for complex functions
3. Keep files focused on single responsibilities
4. Use TypeScript interfaces consistently

### Common Patterns Copilot Knows

- Organism creation with object pooling
- Canvas drawing with error handling
- Test setup with proper mocking
- Performance optimization patterns
- Memory management best practices

### File Naming Conventions

- Components: `ComponentName.ts`
- Tests: `ComponentName.test.ts`
- Types: `types.ts` or `interfaces.ts`
- Utils: `utilityName.ts`

## Troubleshooting Copilot

### If Suggestions Are Poor

1. Check if you're following project patterns
2. Add more context in comments
3. Use type annotations
4. Reference existing similar code

### For Better Canvas Suggestions

1. Include canvas context checks
2. Use error handling patterns
3. Reference existing drawing methods
4. Include touch event handling

### For Performance Code

1. Mention object pooling needs
2. Reference memory management
3. Include performance monitoring
4. Consider batch processing

## Project-Specific Context

### This is a Canvas-Based Simulation

- Organism simulation with growth/death mechanics
- Real-time rendering and interaction
- Performance-critical with large populations
- Cross-platform (desktop + mobile)

### Key Technologies

- **TypeScript** for type safety
- **HTML5 Canvas** for rendering
- **Vite** for building
- **Vitest** for testing
- **Playwright** for E2E testing

### Architecture Highlights

- Object pooling for memory efficiency
- Spatial partitioning for performance
- Error handling with graceful degradation
- Modular component structure

## Contributing

When modifying these Copilot configuration files:

1. Test changes with actual Copilot usage
2. Update patterns based on new project features
3. Keep examples current with codebase
4. Maintain consistency across files

## Resources

- [Copilot Documentation](https://docs.github.com/en/copilot)
- [VS Code Copilot](https://code.visualstudio.com/docs/editor/github-copilot)
- [Project Documentation](../docs/README.md)
- [Developer Guide](../docs/DEVELOPER_GUIDE.md)
