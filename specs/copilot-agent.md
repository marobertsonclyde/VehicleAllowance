# Copilot Studio Agent — Build Reference

**Agent Name:** va_AllowanceAssistant
**Channels:** Teams bot + Embedded web chat in code app

---

## Topic 1: Application Status

**Triggers:** "status of my application", "where is my application", "has my application been approved"

**Actions:**
1. Call flow `va_GetApplicationStatusForUser` with `System.User.Id`
2. Display adaptive card:
   - Application number, status badge
   - Last updated date
   - Current reviewer (if in review)
   - "View Details" button → portal deep link

**Supporting Flow:** `va_GetApplicationStatusForUser`
- Input: SystemUserId (GUID)
- Query: va_AllowanceApplication where va_applicantid = input, not in terminal status
- Output: { applicationNumber, status, submittedOn, lastUpdated }

---

## Topic 2: Allowance Calculator

**Triggers:** "how much would I get", "what is my allowance level", "calculate my allowance"

**Actions:**
1. Ask: "What is your vehicle's total MSRP?" (Money entity)
2. Ask: "Is this an electric vehicle?" (Yes/No)
3. Call flow `va_GetAllowanceLevelForMsrp` with vehicleMsrp
4. Display adaptive card with eligible levels, monthly amounts, and EV supplement if applicable

**Supporting Flow:** `va_GetAllowanceLevelForMsrp`
- Input: vehicleMsrp (number)
- Query: va_AllowanceLevelConfig where va_isCurrentRate = true AND va_minimumMsrp <= input
- Output: Array of { level, minimumMsrp, monthlyAllowance, evChargingAmount }

---

## Topic 3: Document Guidance

**Triggers:** "what documents do I need", "insurance requirements", "what is a dec page"

**Actions:**
1. Display required documents adaptive card:
   - Auto Declarations Page: Shows your vehicle liability coverage limits
   - Umbrella/Personal Excess: Shows additional liability coverage
   - Endorsement: Additional Insured or Additional Interest naming the company
   - Window Sticker: Factory Monroney label showing MSRP
2. Follow-up: Present closed-list entity with document types for detailed requirements
3. On selection: Show specific requirements (e.g., CSL >= $500K for auto)

---

## Topic 4: Program FAQ

**Triggers:** General policy questions, "how does the program work", "when is renewal"

**Actions:**
1. Use Generative Answers with knowledge source: Vehicle Allowance Policy PDF (upload to agent knowledge)
2. Fallback: "Contact the Equipment Department for assistance"

---

## Configuration Notes

- Set **Classic fallback** topic to redirect to "Contact Equipment Department"
- Enable **Generative AI** for Topic 4 only
- Set authentication to **Entra ID SSO** (same tenant as Power Platform)
- Deploy to **Teams** channel for maximum adoption
