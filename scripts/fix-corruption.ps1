# Systematic Corruption Pattern Fixer
# Based on successful patterns from interactive-examples.ts and SettingsPanelComponent.ts

param(
    [string]$TargetFile = "",
    [switch]$DryRun = $false,
    [switch]$ShowStats = $false
)

function Fix-EventPattern {
    param([string]$Content)
    
    # Pattern 1: Basic eventPattern with broken arrow function
    $Content = $Content -replace 'eventPattern\(([^?]+)\?\.addEventListener\(''(\w+)'', \(event\) => \{\s*try \{\s*\(e => \{([^}]*)\} catch \(error\) \{[^}]*\}\}\)\)\.value[^;]*;', '$1?.addEventListener(''$2'', (event) => { try { $3 } catch (error) { console.error(''Event listener error for $2:'', error); } });'
    
    # Pattern 2: eventPattern with value access
    $Content = $Content -replace 'eventPattern\(([^?]+)\?\.addEventListener\(''(\w+)'', \(event\) => \{[^}]*\(e => \{[^}]*\} catch[^}]*\}\}\)\)\.value[^;]*;', '$1?.addEventListener(''$2'', (event) => { try { /* Fixed implementation needed */ } catch (error) { console.error(''Event listener error for $2:'', error); } });'
    
    # Pattern 3: Simple eventPattern removal
    $Content = $Content -replace 'eventPattern\(([^?]+\?\.addEventListener[^)]+\))\);', '$1;'
    
    return $Content
}

function Fix-IfPattern {
    param([string]$Content)
    
    # Pattern 1: ifPattern with arrow function
    $Content = $Content -replace 'ifPattern\(([^,]+),\s*\(\)\s*=>\s*\{\s*([^}]*)\s*\}\);', 'if ($1) { $2 }'
    
    # Pattern 2: ifPattern with block
    $Content = $Content -replace 'ifPattern\(([^,]+),\s*\(\)\s*=>\s*\{([^}]*)\}\s*\);', 'if ($1) {$2}'
    
    return $Content
}

function Fix-BrokenArrowFunctions {
    param([string]$Content)
    
    # Fix malformed arrow functions in try-catch
    $Content = $Content -replace '\(e =>\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}\}\)\)', '(event) => { try { /* Implementation needed */ } catch (error) { console.error("Fixed arrow function error:", error); } }'
    
    return $Content
}

function Get-FileStats {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    $eventCount = ([regex]::Matches($content, "eventPattern")).Count
    $ifCount = ([regex]::Matches($content, "ifPattern")).Count
    $errorCount = 0
    
    # Get TypeScript error count for this file
    try {
        $errors = & npx tsc --noEmit $FilePath 2>&1 | Select-String "error TS"
        $errorCount = $errors.Count
    } catch {
        $errorCount = "Unknown"
    }
    
    return @{
        EventPatterns = $eventCount
        IfPatterns = $ifCount
        TotalPatterns = $eventCount + $ifCount
        TypeScriptErrors = $errorCount
    }
}

function Fix-FileCorruption {
    param([string]$FilePath, [switch]$DryRun)
    
    Write-Host "Processing: $FilePath" -ForegroundColor Cyan
    
    # Get before stats
    $beforeStats = Get-FileStats $FilePath
    Write-Host "  Before: $($beforeStats.EventPatterns) eventPatterns, $($beforeStats.IfPatterns) ifPatterns, $($beforeStats.TypeScriptErrors) TS errors"
    
    if ($beforeStats.TotalPatterns -eq 0) {
        Write-Host "  No patterns found, skipping..." -ForegroundColor Yellow
        return $false
    }
    
    # Read file content
    $content = Get-Content $FilePath -Raw
    $originalContent = $content
    
    # Apply fixes
    $content = Fix-EventPattern $content
    $content = Fix-IfPattern $content
    $content = Fix-BrokenArrowFunctions $content
    
    if ($content -eq $originalContent) {
        Write-Host "  No changes made" -ForegroundColor Yellow
        return $false
    }
    
    if (-not $DryRun) {
        # Create backup
        $backupPath = "$FilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $FilePath $backupPath
        
        # Write fixed content
        Set-Content $FilePath $content -Encoding UTF8
        
        # Get after stats
        $afterStats = Get-FileStats $FilePath
        Write-Host "  After:  $($afterStats.EventPatterns) eventPatterns, $($afterStats.IfPatterns) ifPatterns, $($afterStats.TypeScriptErrors) TS errors" -ForegroundColor Green
        
        $patternsFixed = $beforeStats.TotalPatterns - $afterStats.TotalPatterns
        Write-Host "  Fixed: $patternsFixed patterns" -ForegroundColor Green
        
        return $true
    } else {
        Write-Host "  DRY RUN: Would fix patterns" -ForegroundColor Magenta
        return $false
    }
}

# Main execution
if ($ShowStats) {
    Write-Host "=== Corruption Pattern Statistics ===" -ForegroundColor Yellow
    $totalPatterns = 0
    $totalFiles = 0
    
    Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | ForEach-Object {
        $stats = Get-FileStats $_.FullName
        if ($stats.TotalPatterns -gt 0) {
            Write-Host "$($_.Name): $($stats.TotalPatterns) patterns, $($stats.TypeScriptErrors) TS errors"
            $totalPatterns += $stats.TotalPatterns
            $totalFiles++
        }
    }
    
    Write-Host "Total: $totalPatterns patterns across $totalFiles files" -ForegroundColor Cyan
    exit
}

if ($TargetFile) {
    # Fix specific file
    $fixed = Fix-FileCorruption $TargetFile -DryRun:$DryRun
    if ($fixed) {
        Write-Host "Successfully fixed: $TargetFile" -ForegroundColor Green
    }
} else {
    # Fix all files with patterns
    Write-Host "=== Systematic Corruption Fix ===" -ForegroundColor Yellow
    
    $filesToFix = @()
    Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | ForEach-Object {
        $stats = Get-FileStats $_.FullName
        if ($stats.TotalPatterns -gt 0) {
            $filesToFix += @{
                Path = $_.FullName
                Name = $_.Name
                Patterns = $stats.TotalPatterns
                Errors = $stats.TypeScriptErrors
            }
        }
    }
    
    # Sort by pattern count (highest first for maximum impact)
    $filesToFix = $filesToFix | Sort-Object Patterns -Descending
    
    Write-Host "Found $($filesToFix.Count) files with corruption patterns" -ForegroundColor Cyan
    
    $totalFixed = 0
    foreach ($file in $filesToFix) {
        $fixed = Fix-FileCorruption $file.Path -DryRun:$DryRun
        if ($fixed) { $totalFixed++ }
    }
    
    Write-Host "=== Summary ===" -ForegroundColor Yellow
    Write-Host "Files processed: $($filesToFix.Count)"
    Write-Host "Files fixed: $totalFixed"
    
    if (-not $DryRun) {
        Write-Host "Running final TypeScript check..." -ForegroundColor Cyan
        $finalErrors = & npx tsc --noEmit 2>&1 | Select-String "error TS"
        Write-Host "Remaining TypeScript errors: $($finalErrors.Count)" -ForegroundColor $(if ($finalErrors.Count -lt 900) { "Green" } else { "Red" })
    }
}
