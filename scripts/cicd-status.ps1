#!/usr/bin/env pwsh
# Simple CI/CD Status Checker
param(
    [string]$WorkflowDir = ".github/workflows"
)

Write-Host "CI/CD Workflow Status" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $WorkflowDir)) {
    Write-Host "Workflow directory not found: $WorkflowDir" -ForegroundColor Red
    exit 1
}

$workflowFiles = Get-ChildItem "$WorkflowDir/*.yml" | Sort-Object Name

if ($workflowFiles.Count -eq 0) {
    Write-Host "No workflow files found" -ForegroundColor Yellow
    exit 0
}

Write-Host "Current Workflows:" -ForegroundColor Green
foreach ($file in $workflowFiles) {
    $size = [math]::Round($file.Length / 1KB, 1)
    $status = if ($file.Name -eq "ci-cd.yml") { " (ACTIVE)" } else { "" }
    Write-Host "  $($file.Name) - ${size}KB$status" -ForegroundColor White
}

Write-Host ""
Write-Host "Total workflows: $($workflowFiles.Count)" -ForegroundColor Cyan

$backupDir = "$WorkflowDir/backup"
if (Test-Path $backupDir) {
    $backupFiles = Get-ChildItem "$backupDir/*.yml"
    Write-Host "Backup files: $($backupFiles.Count)" -ForegroundColor Cyan
}

# Check if optimized workflow exists
if (Test-Path "$WorkflowDir/optimized-ci-cd.yml") {
    Write-Host ""
    Write-Host "Optimized workflow ready for migration!" -ForegroundColor Green
    Write-Host "Run: npm run cicd:migrate -Force" -ForegroundColor Yellow
}

Write-Host ""
