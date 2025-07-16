# PowerShell script to fix corrupted ifPattern syntax across all files

Write-Host "Starting systematic fix of corrupted files..."

# Get all TypeScript files that might have corruption
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts" | Where-Object { $_.Name -notlike "*.d.ts" }

$fixedFiles = 0
$totalErrors = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileFixed = $false
    
    # Fix 1: Replace ifPattern calls with if statements
    $content = $content -replace 'ifPattern\s*\(\s*([^,)]+)\s*,\s*\(\)\s*=>\s*\{\s*([^}]+)\s*\}\s*\);', 'if ($1) { $2 }'
    
    # Fix 2: Fix malformed arrow function syntax (()(event);
    $content = $content -replace '\(\(\)\(event\);', '(event) => {'
    
    # Fix 3: Fix broken })) => patterns
    $content = $content -replace '\}\)\)\s*=>\s*\{', '});'
    
    # Fix 4: Fix }); else ifPattern( patterns
    $content = $content -replace '\}\);\s*else\s+ifPattern\s*\([^)]+\)\s*,\s*\(\)\s*=>\s*\{', '} else {'
    
    # Fix 5: Fix optional chaining syntax errors in types
    $content = $content -replace '\?\.\[K\]', '[K]'
    $content = $content -replace '\?\.\[([^\]]+)\]', '[$1]'
    
    # Fix 6: Fix broken catch blocks
    $content = $content -replace '\}\s*catch\s*\(error\)\s*\{\s*\}\)\)', '} catch (error) { /* handled */ }'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedFiles++
        Write-Host "Fixed: $($file.FullName)"
        $fileFixed = $true
    }
}

Write-Host "Fixed $fixedFiles files"

# Check remaining errors
Write-Host "Checking remaining TypeScript errors..."
$errorCount = (npx tsc --noEmit 2>&1 | Measure-Object -Line).Lines
Write-Host "Remaining error lines: $errorCount"
