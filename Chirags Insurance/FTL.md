Feature Ticket List (FTL)
Purpose

This document breaks the entire application into small, independent development tickets that AI can implement one by one.

Each ticket includes:

Feature ID
Feature Name
Module
Description
Acceptance Criteria
Dependencies
Priority
Estimated Complexity
API Dependencies
Database Dependencies
UI Components
Notes
Ticket Template
Feature ID

Feature Name

Module

Priority

Description

Acceptance Criteria

Dependencies

Database Tables

API Endpoints

UI Components

Estimated Complexity

Notes
Phase 1 — Project Setup
CORE-001
Feature Name

Project Initialization

Module

Core

Priority

⭐⭐⭐⭐⭐ Must Have

Description

Initialize the project using Next.js and Laravel. Configure folder structure, environment variables, API communication, Tailwind CSS, shadcn/ui, authentication scaffolding, and database connectivity.

Acceptance Criteria

Frontend starts successfully.
Backend starts successfully.
MySQL connection works.
Environment variables configured.
API communication verified.

Dependencies

None

CORE-002

Authentication Layout

Priority

Must Have

Acceptance Criteria

Login page
Protected routes
Logout
Unauthorized redirect

Depends On

CORE-001

Dashboard
DASH-001

Dashboard Home

Priority

Must Have

Description

Create the main dashboard showing KPIs and recent activity.

Acceptance Criteria

KPI cards displayed
Charts rendered
Recent activities listed
Responsive desktop layout

Dependencies

AUTH-001

DASH-002

Dashboard Statistics API

Depends On

DASH-001

Authentication
AUTH-001

User Login

Priority

⭐⭐⭐⭐⭐

Description

Allow registered users to log in using email and password.

Acceptance Criteria

Email validation
Password validation
JWT/Sanctum token issued
Redirect to dashboard
Invalid credentials show an error

Dependencies

CORE-001

AUTH-002

Logout

Depends On

AUTH-001

AUTH-003

Forgot Password

Depends On

AUTH-001

Motor Management
MOTOR-001

Vehicle List Page

Priority

⭐⭐⭐⭐⭐

Description

Display all vehicles in a searchable and paginated AG Grid table.

Acceptance Criteria

Pagination
Search
Sorting
Filters
Row actions
Export

Dependencies

AUTH-001

MOTOR-002

Add Vehicle

Acceptance Criteria

All mandatory fields validated
Vehicle saved
Success message
Audit log created

Depends On

MOTOR-001

MOTOR-003

Edit Vehicle

Depends On

MOTOR-002

MOTOR-004

Vehicle Details

Depends On

MOTOR-002

MOTOR-005

Delete Vehicle

Depends On

MOTOR-002

Acceptance

Soft delete only

MOTOR-006

Vehicle Search

Search by

Vehicle Number

Owner

Phone

Engine

Chassis

Depends On

MOTOR-001

MOTOR-007

Vehicle Documents

Depends On

MOTOR-004

MOTOR-008

Vehicle Timeline

Depends On

MOTOR-004

Insurance
INS-001

Insurance List

Depends On

MOTOR-002

INS-002

Create Insurance Policy

Acceptance

Search vehicle

↓

Auto-load vehicle

↓

Enter insurance

↓

Save

Depends On

INS-001

INS-003

Renew Policy

Depends On

INS-002

INS-004

Policy Details

Depends On

INS-002

INS-005

Insurance History

Depends On

INS-002

INS-006

Upload Insurance Documents

Depends On

INS-004

Tax
TAX-001

Tax List

TAX-002

Add Tax Record

TAX-003

Edit Tax

TAX-004

Tax History

TAX-005

Print Tax Receipt

Fitness
FIT-001

Fitness List

FIT-002

Add Fitness

FIT-003

Renew Fitness

FIT-004

Fitness History

Permit
PER-001

Permit List

PER-002

Add Permit

PER-003

Renew Permit

PER-004

Permit History

National Permit
NP-001

National Permit List

NP-002

Add National Permit

NP-003

Renew National Permit

NP-004

National Permit History

Reports
REP-001

Vehicle Report

REP-002

Insurance Report

REP-003

Tax Report

REP-004

Fitness Report

REP-005

Permit Report

REP-006

National Permit Report

REP-007

Export PDF

REP-008

Export Excel

User Management
USER-001

User List

USER-002

Create User

USER-003

Edit User

USER-004

Roles & Permissions

Audit Trail
AUDIT-001

Audit Log List

AUDIT-002

Activity Timeline

AUDIT-003

Export Audit Log

Settings
SET-001

Company Profile

SET-002

Insurance Companies

SET-003

Vehicle Classes

SET-004

Vehicle Makes

SET-005

Cities

SET-006

States

SET-007

Application Preferences

Backup
BACKUP-001

Create Database Backup

BACKUP-002

Restore Backup

Help
HELP-001

Help Center

HELP-002

About Application

AI Implementation Rules

At the end of the document, mandatory execution rules such as:

Implement exactly one ticket at a time unless explicitly instructed otherwise.
Do not modify completed tickets without authorization.
Respect all dependencies before starting a ticket.
Reuse existing components and services whenever possible.
Follow the PRD, TAD, DDD, FSD, API Specification, and BRD as the single sources of truth.
Ensure every ticket satisfies all acceptance criteria before marking it complete.
Create database migrations, models, API endpoints, frontend pages, validation, permissions, and audit logging only if required by the ticket.
Keep commits and pull requests scoped to a single ticket.
Do not introduce new features or change business rules unless a new ticket or approved change request exists.
If any requirement is ambiguous or conflicts with another document, stop and request clarification instead of making assumptions.