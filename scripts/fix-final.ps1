# Final cleanup script for remaining complex corrupted patterns

Write-Host "Applying final cleanup for complex corrupted patterns..."

# Helper function to fix event handler patterns
function Fix-EventHandlers($content) {
    # Fix patterns like (()(event); -> (event) => {
    $content = $content -replace '\(\(\)\(event\);[\s\r\n]*([^}]+)[\s\r\n]*\}\)\)\s*=>\s*([^;]+);', '(event) => { $1 }); $2;'
    
    # Fix broken try-catch patterns in event handlers
    $content = $content -replace '\}\s*catch\s*\(error\)\s*\{\s*([^}]*)\s*\}\)\)', '} catch (error) { $1 }'
    
    # Fix remaining broken arrow function closures
    $content = $content -replace '\(\(([^)]*)\)\(event\);[\s\r\n]*([^}]*)[\s\r\n]*\}\)\)\s*=>\s*([^;]+);', '($1) => { $2 }); $3;'
    
    return $content
}

# Helper function to fix method declarations
function Fix-MethodDeclarations($content) {
    # Fix broken method signatures
    $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\):\s*([^{]+)\s*\{[\s\r\n]*([^}]*)[\s\r\n]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}', '$1(): $2 { try { $3 } catch (error) { /* handled */ } }'
    
    return $content
}

# Get specific problematic files
$problematicFiles = @(
    "src/dev/debugMode.ts",
    "src/dev/developerConsole.ts", 
    "src/dev/performanceProfiler.ts",
    "src/ui/components/SettingsPanelComponent.ts",
    "src/ui/components/VisualizationDashboard.ts",
    "src/ui/components/Modal.ts",
    "src/ui/components/HeatmapComponent.ts",
    "src/utils/mobile/MobileUIEnhancer.ts"
)

$fixedFiles = 0

foreach ($filePath in $problematicFiles) {
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Apply fixes
        $content = Fix-EventHandlers $content
        $content = Fix-MethodDeclarations $content
        
        # Additional specific fixes
        $content = $content -replace '\}\s*catch\s*\(error\)\s*\{[\s\r\n]*console\.error[^}]*\}\)\)', '} catch (error) { console.error("Error:", error); }'
        
        # Fix remaining malformed function calls
        $content = $content -replace '\(\(event:\s*any\)\(event\);', '(event: any) => {'
        $content = $content -replace '\}\)\)\s*=>\s*\{[\s\r\n]*([^}]*)[\s\r\n]*\}', '}); $1'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            $fixedFiles++
            Write-Host "Applied final fixes to: $filePath"
        }
    }
}

Write-Host "Applied final fixes to $fixedFiles files"

# Final error count
$errorCount = (npx tsc --noEmit 2>&1 | findstr "error TS" | Measure-Object).Count
Write-Host "Final TypeScript error count: $errorCount"

# Test build
Write-Host "Testing build..."
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!"
} else {
    Write-Host "❌ Build failed"
}
