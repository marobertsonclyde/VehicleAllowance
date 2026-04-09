# Equipment Leader Guide — Vehicle Allowance Program

## Your Role

As Equipment Leader, you are the first human reviewer in the application approval chain. You also manage ongoing compliance — terminating allowances when employees opt out or when insurance lapses without renewal.

All actions are taken in the **Admin App** (model-driven app). You will receive Teams messages when action is needed.

---

## Reviewing Applications

### Finding Applications Pending Your Review

In the Admin App, go to **Review Queue → My Pending Reviews**. This shows all applications currently in the **Equipment Leader Review** status assigned to your queue.

You can also see:
- **All Pending** — applications at any review stage across all reviewers
- **AI Flagged** — applications where the AI could not fully validate documents and manual review is needed

### Reading the Application Form

Open an application to see:

- **Applicant Info** — name, personnel number, company, job title
- **Vehicle** — VIN, year, make, model, MSRP, powertrain type
- **Allowance Level** — selected level and monthly amount
- **AI Validation Score** — composite score (0–100). Scores ≥ 85 are pre-validated by AI; lower scores have specific flags to review.
- **AI Pre-Validated** badge — shown when AI confirmed all insurance limits meet requirements
- **Documents subgrid** — all uploaded documents with AI-extracted values and confidence scores
- **Insurance Policies** — carrier, policy number, expiration date, extracted limits, and whether requirements are met
- **Audit Log** — full history of every status change and decision

### Reviewing Insurance Documents

Click into a document to see the AI-extracted values. Check:

**Auto Declaration Page:**
- CSL ≥ $500,000 OR (BI/person ≥ $250K AND BI/accident ≥ $500K AND PD ≥ $100K)
- Named insured matches the applicant
- Policy is not expired

**Umbrella Declaration Page:**
- Limit ≥ $1,000,000 if endorsed as Additional Insured
- Limit ≥ $2,000,000 if endorsed as Additional Interest
- Endorsement names the correct Clyde subsidiary

If the AI confidence score on a document is below 0.70, review the original document carefully — the extracted values may not be accurate.

---

## Making a Decision

After reviewing, set your decision in the **Equipment Leader Decision** field on the application form:

### Approve

Select **Approved** and save. The application moves to **Director Review** automatically. The Director receives a Teams adaptive card with the application summary and a link to review in the Admin App.

### Return for Corrections

Select **Returned** and fill in the **Equipment Leader Notes** field explaining what the employee needs to fix (e.g., "Please re-upload your umbrella dec page — the endorsement entity name does not match your company."). Save the record.

The employee receives a Teams message with your notes and a link to re-upload. When they resubmit, the application returns to your queue.

### Reject

Select **Rejected** and fill in the **Equipment Leader Notes** field with the reason. The employee receives a Teams message. Rejected applications are closed and cannot be resubmitted — the employee would need to start a new application.

---

## After Your Approval

Once you approve, you have no further action on that application unless it comes back from the Director. The Director and (for new opt-ins) the company President complete their reviews independently. You will receive a Teams notification when the application is fully approved and an Allowance Record is created.

---

## Terminating an Allowance

There are three situations where you terminate an allowance record:

### 1. Employee Opt-Out Request

When an employee submits an opt-out through the portal, you receive a Teams message. To process it:

1. Go to **Active Allowances** in the Admin App and find the employee's Allowance Record.
2. Select **Terminate Allowance** from the command bar.
3. Set **Termination Type** to `Employee Opt-Out — Company Car Requested`.
4. Set the **Termination Date** (confirm with the employee what date works for company vehicle assignment).
5. Add a note if needed and save.

Payroll receives an automatic Teams notification to stop the allowance payment.

### 2. Administrative Termination

If you need to terminate an allowance for a reason other than insurance or opt-out (e.g., employee changes role, leaves the company):

1. Find the Allowance Record in **Active Allowances**.
2. Select **Terminate Allowance** from the command bar.
3. Set **Termination Type** to `Administrative — Equipment Leader` or `Other` as appropriate.
4. Fill in **Termination Reason** with a clear explanation.
5. Set the **Termination Date** and save.

### 3. Insurance Non-Compliance (Automatic)

If an employee's insurance expires and they do not renew within the grace period, the system terminates the allowance automatically and notifies you, the employee, and payroll. No action is needed from you unless the employee contacts you to discuss reinstatement.

To reinstate after an insurance lapse: the employee must upload a new valid policy through the portal, you review and confirm coverage is restored, then manually set the Allowance Record status back to **Active** and update the expiration date on the Insurance Policy record.

---

## Managing Insurance Expiry

The **Active Allowances** area shows an expiry dashboard with all policies expiring in the next 45 days. Review this regularly to stay ahead of lapses.

When a policy expires:
- You receive a Teams message on the expiration date listing the employee and policy details.
- The employee receives escalating reminders leading up to and on the expiration date.
- If no renewal is uploaded within the grace period (configured in Settings → Reminder Configuration), the system terminates the allowance and notifies payroll automatically.

---

## Managing Reference Data

You have access to the **Reference Data** section in the Admin App:

- **Allowance Levels** — view current A/B/C/D monthly amounts. Contact your administrator to update amounts when rates are adjusted.
- **Eligible Titles** — the list of job titles that qualify for the program. Contact your administrator to add or remove titles.
- **Company Entities** — the 8 Clyde subsidiaries with endorsement addresses. Each record also stores the subsidiary president's user ID for routing approvals.
- **Reminder Configuration** — configure how many days before policy expiration reminders are sent, and how long the grace period is after expiration.

---

## Reports and Dashboard

Go to the **Reports** area for:

- **Active Recipients by Level** — current enrollment counts and monthly cost by level
- **Pending Applications by Stage** — applications at each review stage
- **Expiring Insurance** — policies expiring in the next 45 days
- **Terminated Allowances** — allowances terminated this year with reason codes

---

## Questions?

Contact your Power Platform administrator for system access issues. For program policy questions, refer to the Vehicle Allowance Policy document available in the Admin App under **Policy Documents**.
