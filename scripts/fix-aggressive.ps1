# More aggressive fix for remaining corrupted patterns

Write-Host "Applying aggressive fixes for remaining corrupted patterns..."

# Get all TypeScript files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts" | Where-Object { $_.Name -notlike "*.d.ts" }

$fixedFiles = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix malformed try-catch blocks with event handlers
    $content = $content -replace '\(\(event\)\s*=>\s*\{\s*([^}]+)\s*\}\)\)\s*=>\s*\{', 'document.addEventListener("$1", (event) => {'
    
    # Fix broken event listener patterns
    $content = $content -replace '\}\)\)\s*=>\s*\{([^}]*)\}\);', '}); '
    
    # Fix malformed arrow functions in event listeners
    $content = $content -replace '\(\(event:\s*[^)]+\)\(event\);', '(event) => {'
    
    # Fix broken catch-finally patterns
    $content = $content -replace '\}\)\)\s*=>\s*([^;]+);\s*\}\);', '}); $1 });'
    
    # Fix broken ifPattern syntax with complex conditions
    $content = $content -replace 'ifPattern\s*\(\s*([^,{]+),\s*\(\)\s*=>\s*\{\s*([^}]*)\s*\}\);', 'if ($1) { $2 }'
    
    # Fix remaining }); else patterns
    $content = $content -replace '\}\);\s*else\s*ifPattern\s*\(([^)]+)\)\s*,\s*\(\)\s*=>\s*\{([^}]+)\}', '} else if ($1) { $2 }'
    
    # Fix broken event handler closures
    $content = $content -replace '\(\(([^)]*)\)\(event\);', '($1) => {'
    $content = $content -replace '\}\)\)\s*=>\s*([^;]+);', '}); $1;'
    
    # Fix remaining broken arrow function syntax
    $content = $content -replace '\(\(\)\(event\);', '(event) => {'
    $content = $content -replace '\}\)\)\s*=>\s*', '}); '
    
    # Fix try-catch blocks that got mangled
    $content = $content -replace '\}\s*catch\s*\(error\)\s*\{\s*\}\)\)', '} catch (error) { /* ignored */ }'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedFiles++
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Applied aggressive fixes to $fixedFiles files"

# Check progress
$errorCount = (npx tsc --noEmit 2>&1 | findstr "error TS" | Measure-Object).Count
Write-Host "Remaining TypeScript errors: $errorCount"
