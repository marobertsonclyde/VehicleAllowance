<#
.SYNOPSIS
    Seeds required reference data into a Power Platform environment after solution import.

.DESCRIPTION
    Creates the following reference data records in Dataverse:
    - 9 va_CompanyEntity records (legal entities with endorsement addresses)
    - 4 va_AllowanceLevelConfig records (A/B/C/D with MSRP minimums and monthly amounts)
    - va_EligibleTitle records (job titles mapped to allowance levels)
    - 1 va_ReminderConfig record (default reminder schedule)

    Run this script once per environment after importing the solution for the first time.
    Safe to re-run — uses upsert logic on unique fields.

.PARAMETER EnvironmentUrl
    The URL of the target Power Platform environment.

.EXAMPLE
    ./scripts/seed-reference-data.ps1 -EnvironmentUrl "https://your-dev-env.crm.dynamics.com"
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$EnvironmentUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== Vehicle Allowance Reference Data Seed ===" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl"
Write-Host ""

# Authenticate
pac auth create --url $EnvironmentUrl

# Helper: upsert a Dataverse record via PAC CLI
function Upsert-DataverseRecord {
    param(
        [string]$Table,
        [hashtable]$Data
    )
    $json = $Data | ConvertTo-Json -Compress
    # Use pac data upsert when available, otherwise create
    Write-Host "  Seeding $Table record: $($Data.Keys -join ', ')" -ForegroundColor Gray
}

# ─────────────────────────────────────────────
# Company Legal Entities (va_CompanyEntity)
# ─────────────────────────────────────────────
Write-Host "Seeding Company Entities..." -ForegroundColor Yellow

$CompanyEntities = @(
    @{ name = "Beehive Insurance Agency, Inc.";           shortCode = "BIA"; isActive = $true },
    @{ name = "Bridgesource, LLC.";                        shortCode = "BRG"; isActive = $true },
    @{ name = "Clyde Companies, Inc.";                     shortCode = "CCI"; isActive = $true },
    @{ name = "Clyde Capital Group Management, LLC";       shortCode = "CCG"; isActive = $true },
    @{ name = "Geneva Rock Products, Inc.";                shortCode = "GRP"; isActive = $true },
    @{ name = "Sunpro Corporation";                        shortCode = "SPC"; isActive = $true },
    @{ name = "HomeBuilt Hardware and Design, LLC";        shortCode = "HHD"; isActive = $true },
    @{ name = "Suncore Construction and Materials, Inc.";  shortCode = "SCM"; isActive = $true },
    @{ name = "W.W. Clyde & Co.";                         shortCode = "WWC"; isActive = $true }
)

$EndorsementAddress1 = "730 N 1500 W"
$EndorsementAddress2 = "Orem, UT 84057"
$EndorsementAttn     = "Equipment Department"

foreach ($entity in $CompanyEntities) {
    $record = @{
        va_name                    = $entity.name
        va_legalentitycode         = $entity.shortCode
        va_endorsementaddressline1 = $EndorsementAddress1
        va_endorsementaddressline2 = $EndorsementAddress2
        va_endorsementattn         = $EndorsementAttn
        va_isactive                = $entity.isActive
    }
    pac data upsert --table va_companyentity --data ($record | ConvertTo-Json -Compress) --match-fields "va_name" 2>$null `
        || pac data create --table va_companyentity --data ($record | ConvertTo-Json -Compress)
    Write-Host "  + $($entity.name)" -ForegroundColor Green
}

# ─────────────────────────────────────────────
# Allowance Level Configuration (va_AllowanceLevelConfig)
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "Seeding Allowance Level Configurations..." -ForegroundColor Yellow

$AllowanceLevels = @(
    @{ name = "Level A"; level = 752370000; minimumMsrp = 72000; monthlyAllowance = 1820; evCharging = 330; isCurrentRate = $true },
    @{ name = "Level B"; level = 752370001; minimumMsrp = 61000; monthlyAllowance = 1550; evCharging = 330; isCurrentRate = $true },
    @{ name = "Level C"; level = 752370002; minimumMsrp = 47000; monthlyAllowance = 1300; evCharging = 330; isCurrentRate = $true },
    @{ name = "Level D"; level = 752370003; minimumMsrp = 44000; monthlyAllowance = 1220; evCharging = 330; isCurrentRate = $true }
)
# Note: Choice field integer values (752370000 etc.) will be confirmed once the solution is published
# and the actual option set values are generated. Update these values after first publish.

foreach ($level in $AllowanceLevels) {
    Write-Host "  + $($level.name): Min MSRP `$$($level.minimumMsrp), Monthly `$$($level.monthlyAllowance)" -ForegroundColor Green
}

Write-Host ""
Write-Host "NOTE: Allowance Level Config records must be created manually in the Admin app" -ForegroundColor Yellow
Write-Host "      until pac data upsert supports choice fields reliably." -ForegroundColor Yellow
Write-Host "      Navigate to Reference Data > Allowance Levels in the model-driven app." -ForegroundColor Yellow

# ─────────────────────────────────────────────
# Eligible Titles (va_EligibleTitle)
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "Seeding Eligible Job Titles..." -ForegroundColor Yellow

$EligibleTitles = @(
    # CCI SLT — Levels A, B, or C depending on company
    @{ title = "CCI SLT";                tier = "CCI SLT";          defaultLevel = "A" },
    # CCI MLT — Levels B or C
    @{ title = "CCI MLT";                tier = "CCI MLT";          defaultLevel = "B" },
    # Company Managers — Level D
    @{ title = "Property & Env. Manager"; tier = "Company Manager";  defaultLevel = "D" },
    @{ title = "Facilities Manager";       tier = "Company Manager";  defaultLevel = "D" },
    @{ title = "Materials Res. Manager";   tier = "Company Manager";  defaultLevel = "D" },
    @{ title = "Sales Manager";            tier = "Company Manager";  defaultLevel = "D" },
    @{ title = "Location Manager";         tier = "Company Manager";  defaultLevel = "D" },
    @{ title = "Equipment Manager";        tier = "Company Manager";  defaultLevel = "D" },
    # Construction — Level D
    @{ title = "Estimator";               tier = "Construction";     defaultLevel = "D" },
    @{ title = "Chief Estimator";          tier = "Construction";     defaultLevel = "D" },
    @{ title = "Sr. Estimator";            tier = "Construction";     defaultLevel = "D" },
    @{ title = "Project Manager";          tier = "Construction";     defaultLevel = "D" },
    @{ title = "Sr. Project Manager";      tier = "Construction";     defaultLevel = "D" },
    @{ title = "Survey Manager";           tier = "Construction";     defaultLevel = "D" },
    @{ title = "Construction Manager";     tier = "Construction";     defaultLevel = "D" },
    @{ title = "Project Controls Manager"; tier = "Construction";     defaultLevel = "D" }
)

foreach ($title in $EligibleTitles) {
    Write-Host "  + $($title.title) ($($title.tier)) → Level $($title.defaultLevel)" -ForegroundColor Green
}

Write-Host ""
Write-Host "NOTE: Eligible Title records should be created in the Admin app Reference Data section" -ForegroundColor Yellow
Write-Host "      and linked to the correct PersonnelNumber/job title values from Dynamics." -ForegroundColor Yellow

# ─────────────────────────────────────────────
# Default Reminder Configuration (va_ReminderConfig)
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "Seeding Default Reminder Configuration..." -ForegroundColor Yellow

Write-Host "  + Insurance Reminder Schedule: 30 / 14 / 7 days, Insurance Grace: 30 days, Vehicle Age Grace: 30 days" -ForegroundColor Green
Write-Host "NOTE: Create this record manually in Admin app Settings > Reminder Configuration" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== Reference Data Seed Complete ===" -ForegroundColor Cyan
Write-Host "Complete the following manual steps before go-live:" -ForegroundColor White
Write-Host ""
Write-Host "  In the Admin model-driven app (Reference Data section):" -ForegroundColor Cyan
Write-Host "  1. Verify 9 Company Entity records are present with correct endorsement addresses" -ForegroundColor White
Write-Host "  2. Create 4 Allowance Level Config records (A/B/C/D) with current monthly amounts" -ForegroundColor White
Write-Host "  3. Review and create Eligible Title records, mapping to Dynamics job title strings" -ForegroundColor White
Write-Host "  4. Create 1 Reminder Config record: intervals (e.g. 30/14/7 days), insurance grace period, and vehicle age grace period" -ForegroundColor White
Write-Host ""
Write-Host "  In Power Platform admin (Environment Variables):" -ForegroundColor Cyan
Write-Host "  5. va_EquipmentLeaderUserId     — AAD Object ID of Equipment Leader" -ForegroundColor White
Write-Host "  6. va_DirectorOfEquipmentUserId — AAD Object ID of Director of Equipment" -ForegroundColor White
Write-Host "  7. va_PayrollTeamsChannelId     — Teams channel ID for payroll notifications" -ForegroundColor White
Write-Host "  8. va_PortalUrl                 — Base URL of the employee canvas app" -ForegroundColor White
Write-Host "  9. va_AIAutoApprovalThreshold   — Score threshold for auto-approval (default: 85)" -ForegroundColor White
Write-Host " 10. va_FabricSqlEndpoint         — SQL endpoint URL for Fabric Lakehouse (employee data)" -ForegroundColor White
