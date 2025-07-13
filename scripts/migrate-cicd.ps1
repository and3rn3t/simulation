#!/usr/bin/env pwsh
# CI/CD Pipeline Migration Script
# This script helps migrate from multiple workflows to the optimized single workflow

param(
    [string]$Action = "backup",
    [switch]$Force = $false
)

Write-Host "CI/CD Pipeline Migration Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$workflowDir = ".github/workflows"
$backupDir = ".github/workflows/backup"

function Show-Help {
    Write-Host ""
    Write-Host "Usage: .\migrate-cicd.ps1 [action] [-Force]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Green
    Write-Host "  backup     - Create backup of existing workflows"
    Write-Host "  migrate    - Activate optimized workflow (requires -Force)"
    Write-Host "  rollback   - Restore original workflows (requires -Force)"
    Write-Host "  cleanup    - Remove old workflow files (requires -Force)"
    Write-Host "  status     - Show current workflow status"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\migrate-cicd.ps1 backup"
    Write-Host "  .\migrate-cicd.ps1 migrate -Force"
    Write-Host "  .\migrate-cicd.ps1 status"
    Write-Host ""
}

function Test-WorkflowDirectory {
    if (!(Test-Path $workflowDir)) {
        Write-Error "Workflow directory not found: $workflowDir"
        Write-Host "Are you in the project root directory?" -ForegroundColor Yellow
        exit 1
    }
}

function New-Backup {
    Write-Host "Creating backup of existing workflows..." -ForegroundColor Yellow
    
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Write-Host "Created backup directory: $backupDir" -ForegroundColor Green
    }
    
    $workflowFiles = Get-ChildItem "$workflowDir/*.yml" -Exclude "optimized-ci-cd.yml"
    
    if ($workflowFiles.Count -eq 0) {
        Write-Host "No workflow files found to backup" -ForegroundColor Yellow
        return
    }
    
    foreach ($file in $workflowFiles) {
        $destPath = Join-Path $backupDir $file.Name
        Copy-Item $file.FullName $destPath -Force
        Write-Host "Backed up: $($file.Name)" -ForegroundColor Gray
    }
    
    Write-Host "Backup completed: $($workflowFiles.Count) files backed up" -ForegroundColor Green
}

function Start-Migration {
    if (!$Force) {
        Write-Host "Migration requires -Force flag for safety" -ForegroundColor Red
        Write-Host "Example: .\migrate-cicd.ps1 migrate -Force" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Starting migration to optimized workflow..." -ForegroundColor Yellow
    
    # Check if optimized workflow exists
    $optimizedWorkflow = "$workflowDir/optimized-ci-cd.yml"
    if (!(Test-Path $optimizedWorkflow)) {
        Write-Error "Optimized workflow not found: $optimizedWorkflow"
        Write-Host "Please ensure the optimized workflow file exists before migration." -ForegroundColor Yellow
        return
    }
    
    # Backup first
    New-Backup
    
    # Rename current ci-cd.yml if it exists
    $currentCiCd = "$workflowDir/ci-cd.yml"
    if (Test-Path $currentCiCd) {
        Rename-Item $currentCiCd "$workflowDir/ci-cd-old.yml" -Force
        Write-Host "Renamed existing ci-cd.yml to ci-cd-old.yml" -ForegroundColor Gray
    }
    
    # Activate optimized workflow
    Rename-Item $optimizedWorkflow $currentCiCd -Force
    Write-Host "Activated optimized workflow as ci-cd.yml" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test the workflow on a feature branch" -ForegroundColor White
    Write-Host "2. Monitor the first few executions" -ForegroundColor White
    Write-Host "3. Run cleanup after validation" -ForegroundColor White
}

function Start-Rollback {
    if (!$Force) {
        Write-Host "Rollback requires -Force flag for safety" -ForegroundColor Red
        Write-Host "Example: .\migrate-cicd.ps1 rollback -Force" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Rolling back to original workflows..." -ForegroundColor Yellow
    
    if (!(Test-Path $backupDir)) {
        Write-Error "Backup directory not found: $backupDir"
        return
    }
    
    # Remove current optimized workflow
    $currentCiCd = "$workflowDir/ci-cd.yml"
    if (Test-Path $currentCiCd) {
        Remove-Item $currentCiCd -Force
        Write-Host "Removed optimized workflow" -ForegroundColor Gray
    }
    
    # Restore from backup
    $backupFiles = Get-ChildItem "$backupDir/*.yml"
    foreach ($file in $backupFiles) {
        $destPath = Join-Path $workflowDir $file.Name
        Copy-Item $file.FullName $destPath -Force
        Write-Host "Restored: $($file.Name)" -ForegroundColor Gray
    }
    
    Write-Host "Rollback completed: $($backupFiles.Count) files restored" -ForegroundColor Green
}

function Start-Cleanup {
    if (!$Force) {
        Write-Host "Cleanup requires -Force flag for safety" -ForegroundColor Red
        Write-Host "Example: .\migrate-cicd.ps1 cleanup -Force" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Cleaning up old workflow files..." -ForegroundColor Yellow
    
    $oldFiles = @(
        "ci-cd-old.yml",
        "quality-monitoring.yml",
        "security-advanced.yml",
        "infrastructure-monitoring.yml",
        "release-management.yml",
        "advanced-deployment.yml",
        "project-management.yml",
        "environment-management.yml"
    )
    
    $removedCount = 0
    foreach ($fileName in $oldFiles) {
        $filePath = Join-Path $workflowDir $fileName
        if (Test-Path $filePath) {
            Remove-Item $filePath -Force
            Write-Host "Removed: $fileName" -ForegroundColor Gray
            $removedCount++
        }
    }
    
    Write-Host "Cleanup completed: $removedCount files removed" -ForegroundColor Green
}

function Show-Status {
    Write-Host "Current Workflow Status" -ForegroundColor Yellow
    Write-Host ""
    
    $workflowFiles = Get-ChildItem "$workflowDir/*.yml" | Sort-Object Name
    
    if ($workflowFiles.Count -eq 0) {
        Write-Host "No workflow files found" -ForegroundColor Yellow
        return
    }
    
    foreach ($file in $workflowFiles) {
        $size = [math]::Round($file.Length / 1KB, 1)
        $status = if ($file.Name -eq "ci-cd.yml") { " (ACTIVE)" } else { "" }
        Write-Host "$($file.Name) - ${size}KB$status" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Total workflows: $($workflowFiles.Count)" -ForegroundColor Cyan
    
    if (Test-Path $backupDir) {
        $backupFiles = Get-ChildItem "$backupDir/*.yml"
        Write-Host "Backup files: $($backupFiles.Count)" -ForegroundColor Cyan
    }
}

# Main execution
Test-WorkflowDirectory

switch ($Action.ToLower()) {
    "backup" { New-Backup }
    "migrate" { Start-Migration }
    "rollback" { Start-Rollback }
    "cleanup" { Start-Cleanup }
    "status" { Show-Status }
    "help" { Show-Help }
    default { 
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Show-Help
    }
}

Write-Host ""
