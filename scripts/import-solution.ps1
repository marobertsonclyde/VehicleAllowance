<#
.SYNOPSIS
    Packs and imports the VehicleAllowanceSolution into a Power Platform environment.

.DESCRIPTION
    Packs the unpacked solution from src/VehicleAllowanceSolution/, then imports
    it into the specified Power Platform environment. Applies environment variable
    values from the provided settings file.

.PARAMETER EnvironmentUrl
    The URL of the target Power Platform environment.
    Example: https://your-test-env.crm.dynamics.com

.PARAMETER SettingsFile
    Path to the deployment settings JSON file containing environment variable values.
    Defaults to config/dev-environment-variables.json.

.PARAMETER Managed
    If specified, packs and imports as a Managed solution. Use for Test and Prod.

.PARAMETER SolutionName
    The unique name of the solution. Defaults to VehicleAllowanceSolution.

.EXAMPLE
    # Import to Dev (unmanaged)
    ./scripts/import-solution.ps1 -EnvironmentUrl "https://dev.crm.dynamics.com" -SettingsFile "config/dev-environment-variables.json"

    # Import to Test (managed)
    ./scripts/import-solution.ps1 -EnvironmentUrl "https://test.crm.dynamics.com" -SettingsFile "config/test-environment-variables.json" -Managed
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory = $false)]
    [string]$SettingsFile = "config/dev-environment-variables.json",

    [Parameter(Mandatory = $false)]
    [switch]$Managed,

    [Parameter(Mandatory = $false)]
    [string]$SolutionName = "VehicleAllowanceSolution"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$SolutionFolder = Join-Path $RepoRoot "src\$SolutionName"
$PackageType = if ($Managed) { "Managed" } else { "Unmanaged" }
$ZipFile = Join-Path $RepoRoot "out\${SolutionName}_${PackageType}.zip"
$SettingsFilePath = Join-Path $RepoRoot $SettingsFile

Write-Host "=== Vehicle Allowance Solution Import ===" -ForegroundColor Cyan
Write-Host "Environment  : $EnvironmentUrl"
Write-Host "Solution     : $SolutionName"
Write-Host "Package type : $PackageType"
Write-Host "Settings     : $SettingsFilePath"
Write-Host ""

if (-not (Test-Path $SolutionFolder)) {
    Write-Error "Solution folder not found: $SolutionFolder. Run export-solution.ps1 first."
    exit 1
}

# Ensure output directory exists
if (-not (Test-Path (Join-Path $RepoRoot "out"))) {
    New-Item -ItemType Directory -Path (Join-Path $RepoRoot "out") | Out-Null
}

# Authenticate
Write-Host "Authenticating to Power Platform..." -ForegroundColor Yellow
pac auth create --url $EnvironmentUrl

# Pack the solution
Write-Host "Packing solution '$SolutionName' as $PackageType..." -ForegroundColor Yellow
pac solution pack `
    --zipfile $ZipFile `
    --folder $SolutionFolder `
    --packagetype $PackageType

Write-Host "Pack complete. Importing..." -ForegroundColor Yellow

# Import with deployment settings
$importArgs = @(
    "solution", "import",
    "--path", $ZipFile,
    "--force-overwrite",
    "--publish-changes",
    "--activate-plugins"
)

if (Test-Path $SettingsFilePath) {
    $importArgs += @("--deployment-settings-file", $SettingsFilePath)
} else {
    Write-Warning "Settings file not found: $SettingsFilePath. Importing without environment variable values."
    Write-Warning "Update environment variables manually in the Power Platform admin center after import."
}

pac @importArgs

Write-Host ""
Write-Host "Import complete to: $EnvironmentUrl" -ForegroundColor Green
Write-Host "Verify the solution in Power Platform admin center." -ForegroundColor Green
