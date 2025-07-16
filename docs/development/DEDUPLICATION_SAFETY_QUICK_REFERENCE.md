# 🛡️ Deduplication Safety - Quick Reference

## 🚨 CRITICAL: Always Use Safe Commands

### ❌ NEVER USE THESE DIRECTLY

```powershell
npm run sonar                    # Dangerous - no safety checks
sonar-scanner                   # Dangerous - no backup/validation
```

### ✅ ALWAYS USE THESE INSTEAD

```powershell
npm run sonar:safe              # Safe SonarCloud with backup/validation
npm run deduplication:full-audit # Interactive full audit process
```

## 🔧 Quick Commands

| Command                            | Purpose                | When to Use                        |
| ---------------------------------- | ---------------------- | ---------------------------------- |
| `npm run sonar:safe`               | Safe SonarCloud scan   | **Use instead of `npm run sonar`** |
| `npm run deduplication:full-audit` | Interactive full audit | Major deduplication operations     |
| `npm run deduplication:pre-check`  | Pre-validation only    | Before manual deduplication        |
| `npm run deduplication:post-check` | Post-validation only   | After manual deduplication         |

## 🚨 Signs of Corruption to Watch For

```typescript
// ❌ If you see these patterns, STOP and run safety audit:
ifPattern(element, () => {})         // Non-existent function
eventPattern(element, 'click', () => {}) // Non-existent function
(()(event);                          // Malformed event handler
import { ifPattern } from '...';     // Non-existent import
addEventListener()                   // Empty event listener
```

## 📋 Emergency Recovery

```powershell
# 1. Check current status
npm run deduplication:post-check

# 2. Find recent backups
ls .deduplication-backups/

# 3. If needed, restore from backup manually
# Copy from: .deduplication-backups/backup-{sessionId}/
```

## 🎯 What Caused Our Recent Issues?

**Problem**: Automated deduplication tools introduced:

- Fake `UltimatePatternConsolidator` imports
- Malformed `ifPattern()` and `eventPattern()` calls
- Broken event listener syntax
- Corrupted mobile utility files

**Solution**: Always use safety-wrapped commands that:

- Create backups before changes
- Validate syntax before/after
- Automatically rollback on failure
- Generate audit reports

## 📊 Current SonarCloud Status

- **Target**: <3% code duplication ✅
- **Current**: Successfully achieved (see SONARCLOUD_QUALITY_IMPROVEMENT_COMPLETE.md)
- **Method**: **ONLY use `npm run sonar:safe`**

---

**Remember**: It's better to have slightly higher duplication than broken code that can't build. Safety first!

## Generated: January 2025
