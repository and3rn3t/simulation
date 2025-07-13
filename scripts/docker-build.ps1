# Optimized Docker Build Script for Organism Simulation
# Usage: ./scripts/docker-build.ps1 [target] [tag]

param(
    [string]$Target = "production",
    [string]$Tag = "organism-simulation:latest",
    [switch]$NoCache = $false,
    [switch]$Squash = $false
)

# Get build metadata
$BuildDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$VcsRef = git rev-parse --short HEAD
$Version = "1.0.$(git rev-list --count HEAD)"

Write-Host "🚀 Building Organism Simulation Docker Image" -ForegroundColor Cyan
Write-Host "Target: $Target" -ForegroundColor Green
Write-Host "Tag: $Tag" -ForegroundColor Green
Write-Host "Build Date: $BuildDate" -ForegroundColor Yellow
Write-Host "VCS Ref: $VcsRef" -ForegroundColor Yellow
Write-Host "Version: $Version" -ForegroundColor Yellow

# Build command
$BuildArgs = @(
    "build"
    "--target", $Target
    "--tag", $Tag
    "--build-arg", "BUILD_DATE=$BuildDate"
    "--build-arg", "VCS_REF=$VcsRef"
    "--build-arg", "VERSION=$Version"
    "--pull"
)

if ($NoCache) {
    $BuildArgs += "--no-cache"
}

if ($Squash) {
    $BuildArgs += "--squash"
}

$BuildArgs += "."

Write-Host "🔨 Running: docker $($BuildArgs -join ' ')" -ForegroundColor Blue

try {
    & docker @BuildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
        
        # Show image info
        Write-Host "`n📊 Image Information:" -ForegroundColor Cyan
        docker images $Tag --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
        
        # Security scan recommendation
        Write-Host "`n🔒 Security Scan:" -ForegroundColor Yellow
        Write-Host "Run: docker scout quickview $Tag" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host "❌ Build failed with error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
