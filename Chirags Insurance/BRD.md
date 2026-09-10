Business Rules Document (BRD)
1. Business Overview
Company Background
Business Process
Current Workflow
Future Workflow
Business Objectives
2. Master Data Rules

Define all master data.

Vehicle Classes
Vehicle Makes
Vehicle Types
Insurance Companies
States
Cities
User Roles
Status Types

Rules

Who can create them
Who can edit them
Who can delete them
3. Vehicle (Motor) Rules

The Motor module is the master record.

Rules like:

Vehicle Number must be unique.
One vehicle can have multiple insurance policies.
One vehicle can have multiple tax records.
One vehicle can have multiple fitness records.
One vehicle can have multiple permits.
One vehicle can have multiple national permits.
Vehicle cannot be permanently deleted if child records exist.
Soft delete preferred.
Vehicle Number cannot be edited after creation (or define under what conditions it can).
4. Insurance Rules

Business workflow

Search Vehicle

↓

Auto-load Vehicle Details

↓

Enter Insurance Details

↓

Validate

↓

Save Policy

↓

Create Audit Log

Rules

Insurance cannot exist without a vehicle.
Policy Number uniqueness rule (e.g., unique within an insurance company).
Expiry Date must be after Start Date.
Renewals create a new policy, not overwrite the old one.
Previous policies become history.
Only one policy can be marked as Active at a time.
5. Tax Rules
Every payment creates a new tax record.
Previous records remain as history.
Penalty cannot be negative.
Interest cannot be negative.
Receipt Number validation.
Up To Date must not precede Paid Date.
Latest valid tax record determines vehicle's tax status.
6. Fitness Rules
Every renewal creates a new record.
Expired certificates remain in history.
Passed By is mandatory.
Expiry Date must be after Certificate Date.
Only one current certificate is active.
7. Permit Rules
Permit Number validation.
Receipt Number uniqueness (if applicable).
Permit Date ≤ Expiry Date.
Renewals create new records.
Only one active permit per permit type.
8. National Permit Rules
One record per renewal.
State information required.
Address required.
History maintained.
Current active record identified by latest valid expiry.
9. Dashboard Rules

KPIs

Total Vehicles

Insurance Expiring

Insurance Expired

Tax Due

Fitness Due

Permit Due

National Permit Due

Rules

Define how each KPI is calculated.
Define "Expiring Soon" (e.g., within 30 days).
10. Search Rules

Global Search

Search by

Vehicle Number
Owner Name
Phone
Engine Number
Chassis Number
Policy Number
Permit Number

Rules

Partial search supported.
Case-insensitive.
Results sorted by relevance or vehicle number.
11. Report Rules

Vehicle Reports

Insurance Reports

Tax Reports

Fitness Reports

Permit Reports

National Permit Reports

Rules

Reports reflect current filters.
PDF/Excel exports match on-screen data.
Date ranges inclusive.
12. User Rules

Admin

Manager

Operator

Viewer

Define exactly what each role can:

Create

Edit

Delete

Print

Export

Configure

13. Audit Rules

Log

Login

Logout

Create

Update

Delete

Print

Export

Settings Changes

Rules

Audit logs cannot be edited.
Audit logs cannot be deleted.
Record timestamp and user for every action.
14. Validation Rules

Every field

Required

Optional

Length

Unique

Numeric

Date

Pattern

Business Validation

15. Status Rules

Vehicle

Active

Inactive

Archived

Insurance

Active

Expired

Renewed

Cancelled

Tax

Paid

Due

Overdue

Apply similar status definitions across modules.

16. Deletion Rules

Can delete?

Vehicle

Insurance

Tax

Fitness

Permit

National Permit

Documents

Users

Recommend:

Soft delete for business records.
Hard delete only for administrators in exceptional cases.
17. Document Rules

Allowed Types

PDF

JPG

PNG

Maximum Size

Naming Convention

Linking to records

Retention policy

18. Backup Rules

Who can back up?

Who can restore?

Backup frequency

Restore process

19. Security Rules

Password policy

Session timeout

Permission inheritance

Role restrictions

File upload validation

20. Exception Handling

Examples:

Duplicate Vehicle Number
Invalid Policy Dates
Missing Required Fields
Expired Permit
Missing Vehicle
Unauthorized Access

Define the expected system response for each.

21. Approval Rules (Optional)

If your business requires approvals:

Vehicle approval
Insurance approval
Tax approval

Or specify that no approval workflow exists.

22. Data Retention Rules

How long to keep:

Audit logs
Insurance history
Tax history
Uploaded documents