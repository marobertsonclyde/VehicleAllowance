<#
.SYNOPSIS
    Exports and unpacks the VehicleAllowanceSolution from a Power Platform environment.

.DESCRIPTION
    Authenticates to the specified Power Platform environment using PAC CLI,
    exports the solution, and unpacks it into src/VehicleAllowanceSolution/
    for source control.

.PARAMETER EnvironmentUrl
    The URL of the Power Platform environment to export from.
    Example: https://your-dev-env.crm.dynamics.com

.PARAMETER SolutionName
    The unique name of the solution to export. Defaults to VehicleAllowanceSolution.

.EXAMPLE
    ./scripts/export-solution.ps1 -EnvironmentUrl "https://your-dev-env.crm.dynamics.com"
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory = $false)]
    [string]$SolutionName = "VehicleAllowanceSolution"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$SolutionFolder = Join-Path $RepoRoot "src\$SolutionName"
$TempZip = Join-Path $RepoRoot "out\${SolutionName}_export.zip"

Write-Host "=== Vehicle Allowance Solution Export ===" -ForegroundColor Cyan
Write-Host "Environment : $EnvironmentUrl"
Write-Host "Solution    : $SolutionName"
Write-Host "Output      : $SolutionFolder"
Write-Host ""

# Ensure output directory exists
if (-not (Test-Path (Join-Path $RepoRoot "out"))) {
    New-Item -ItemType Directory -Path (Join-Path $RepoRoot "out") | Out-Null
}

# Authenticate (interactive if not already authenticated)
Write-Host "Authenticating to Power Platform..." -ForegroundColor Yellow
pac auth create --url $EnvironmentUrl

# Export the solution (unmanaged)
Write-Host "Exporting solution '$SolutionName'..." -ForegroundColor Yellow
pac solution export `
    --name $SolutionName `
    --path $TempZip `
    --managed false `
    --overwrite

Write-Host "Export complete. Unpacking..." -ForegroundColor Yellow

# Unpack into src/
pac solution unpack `
    --zipfile $TempZip `
    --folder $SolutionFolder `
    --packagetype Unmanaged `
    --allowDelete true `
    --allowWrite true

Write-Host ""
Write-Host "Done. Solution unpacked to: $SolutionFolder" -ForegroundColor Green
Write-Host "Review changes with: git diff src/" -ForegroundColor Green
Write-Host "Stage and commit when ready: git add src/ && git commit -m 'your message'" -ForegroundColor Green
