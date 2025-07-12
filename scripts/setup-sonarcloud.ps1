#!/usr/bin/env pwsh
# SonarCloud Setup Helper Script for Windows PowerShell
# This script provides quick commands to help set up SonarCloud integration

Write-Host "🔍 SonarCloud Setup Helper for Organism Simulation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Choose an option:" -ForegroundColor Yellow
    Write-Host "1. Open SonarCloud website" -ForegroundColor White
    Write-Host "2. Open VS Code Extensions marketplace (SonarLint)" -ForegroundColor White
    Write-Host "3. Show VS Code settings path" -ForegroundColor White
    Write-Host "4. Open GitHub repository settings" -ForegroundColor White
    Write-Host "5. Show current SonarCloud configuration" -ForegroundColor White
    Write-Host "6. Test SonarCloud integration" -ForegroundColor White
    Write-Host "7. Show setup documentation" -ForegroundColor White
    Write-Host "8. Exit" -ForegroundColor White
    Write-Host ""
}

function Open-SonarCloud {
    Write-Host "🌐 Opening SonarCloud..." -ForegroundColor Green
    Start-Process "https://sonarcloud.io/"
}

function Open-VSCodeExtensions {
    Write-Host "🔌 Opening VS Code Extensions for SonarLint..." -ForegroundColor Green
    Start-Process "https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode"
}

function Show-VSCodeSettings {
    Write-Host "⚙️ VS Code Settings Location:" -ForegroundColor Green
    Write-Host "Windows: %APPDATA%\Code\User\settings.json" -ForegroundColor Cyan
    Write-Host "Or press Ctrl+, in VS Code and click 'Open Settings (JSON)'" -ForegroundColor Cyan
}

function Open-GitHubSettings {
    Write-Host "🔐 Opening GitHub repository settings..." -ForegroundColor Green
    Start-Process "https://github.com/and3rn3t/simulation/settings"
}

function Show-CurrentConfig {
    Write-Host "📋 Current SonarCloud Configuration:" -ForegroundColor Green
    Write-Host ""
    if (Test-Path "sonar-project.properties") {
        Get-Content "sonar-project.properties" | ForEach-Object {
            Write-Host $_ -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ sonar-project.properties not found!" -ForegroundColor Red
    }
}

function Test-Integration {
    Write-Host "🧪 Testing SonarCloud Integration..." -ForegroundColor Green
    Write-Host ""
    
    # Check if sonar-project.properties exists
    if (Test-Path "sonar-project.properties") {
        Write-Host "✅ sonar-project.properties found" -ForegroundColor Green
    } else {
        Write-Host "❌ sonar-project.properties not found" -ForegroundColor Red
    }
    
    # Check for SonarCloud workflow
    if (Test-Path ".github/workflows/quality-monitoring.yml") {
        Write-Host "✅ Quality monitoring workflow found" -ForegroundColor Green
        
        # Check if it contains SonarCloud action
        $content = Get-Content ".github/workflows/quality-monitoring.yml" -Raw
        if ($content -match "sonarcloud-github-action") {
            Write-Host "✅ SonarCloud action configured in workflow" -ForegroundColor Green
        } else {
            Write-Host "⚠️ SonarCloud action not found in workflow" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Quality monitoring workflow not found" -ForegroundColor Red
    }
    
    # Check package.json for test:coverage script
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        if ($packageJson.scripts."test:coverage") {
            Write-Host "✅ Coverage script found in package.json" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Coverage script not found in package.json" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Set up SonarCloud account and import project" -ForegroundColor White
    Write-Host "2. Generate token and add to GitHub secrets" -ForegroundColor White
    Write-Host "3. Configure VS Code SonarLint extension" -ForegroundColor White
    Write-Host "4. Test by pushing a commit to trigger workflow" -ForegroundColor White
}

function Show-Documentation {
    Write-Host "📚 Opening setup documentation..." -ForegroundColor Green
    if (Test-Path "docs/infrastructure/SONARCLOUD_SETUP_GUIDE_COMPLETE.md") {
        Start-Process "docs/infrastructure/SONARCLOUD_SETUP_GUIDE_COMPLETE.md"
    } else {
        Write-Host "❌ Documentation not found!" -ForegroundColor Red
    }
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-8)"
    
    switch ($choice) {
        "1" { Open-SonarCloud }
        "2" { Open-VSCodeExtensions }
        "3" { Show-VSCodeSettings }
        "4" { Open-GitHubSettings }
        "5" { Show-CurrentConfig }
        "6" { Test-Integration }
        "7" { Show-Documentation }
        "8" { 
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            break
        }
        default { 
            Write-Host "❌ Invalid choice. Please enter 1-8." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "8") {
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
    }
} while ($choice -ne "8")
