API Specification Document
1. Overview
API Purpose
Base URL
Versioning Strategy (/api/v1)
REST Standards
Naming Conventions
2. Authentication
Login
POST /api/v1/auth/login

Request

Response

Errors

Validation

Logout
POST /api/v1/auth/logout
Current User
GET /api/v1/auth/me
Refresh Token
POST /api/v1/auth/refresh
3. Dashboard APIs

Dashboard Summary

GET /dashboard

Returns

Total Vehicles
Insurance Due
Tax Due
Fitness Due
Permit Due
National Permit Due

Recent Activities

GET /dashboard/recent

Charts

GET /dashboard/charts
4. Motor Management APIs

Vehicle List

GET /vehicles

Supports

Pagination
Search
Filters
Sorting

Vehicle Details

GET /vehicles/{id}

Create Vehicle

POST /vehicles

Update Vehicle

PUT /vehicles/{id}

Delete Vehicle

DELETE /vehicles/{id}

Vehicle Search

GET /vehicles/search

Search By

Vehicle Number

Owner

Phone

Engine

Chassis

Vehicle Timeline

GET /vehicles/{id}/timeline
5. Insurance APIs

List Policies

Create Policy

Renew Policy

Update Policy

Delete Policy

Policy History

Upload Documents

Download PDF

6. Tax APIs

Create

Update

Delete

History

Receipt

7. Fitness APIs

Create

Renew

History

Delete

8. Permit APIs

Create

Renew

History

Delete

9. National Permit APIs

Create

Renew

History

Delete

10. Reports APIs

Vehicle Report

Insurance Report

Tax Report

Fitness Report

Permit Report

National Permit Report

Export PDF

Export Excel

Print

11. User APIs

Users

Roles

Permissions

Profile

Password

12. Audit APIs

Logs

Filters

Export

13. Settings APIs

Company

Insurance Companies

Makes

Models

Classes

Cities

States

System Preferences

14. File Upload APIs

Upload

Download

Delete

Preview

15. Response Standards

Every response should follow a consistent format.

Success

{
  "success": true,
  "message": "Vehicle created successfully.",
  "data": {}
}

Validation Error

{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}

Server Error

{
  "success": false,
  "message": "Internal server error."
}
16. HTTP Status Codes
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
17. Validation Rules

Every endpoint should document:

Required Fields

Optional Fields

Accepted Formats

Minimum Values

Maximum Values

Business Rules

18. Pagination

Standard format

page

per_page

total

last_page
19. Filtering

Examples

Vehicle Type

Insurance Company

Expiry Date

Status

Date Range

20. Sorting

Ascending

Descending

Multiple Column Sorting

21. Search

Global Search

Module Search

Advanced Search

22. Security

JWT

Permissions

Middleware

Rate Limiting

Input Validation

23. API Versioning
/api/v1

Future

/api/v2
24. Error Codes

Every module should define business-specific error codes, for example:

VEHICLE_NOT_FOUND
DUPLICATE_VEHICLE_NUMBER
POLICY_ALREADY_EXISTS
INVALID_POLICY_DATE
TAX_RECORD_NOT_FOUND

These codes make frontend error handling more reliable.