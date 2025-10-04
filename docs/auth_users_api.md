# Auth and User Management API

This document describes the authentication and user management endpoints.

Base paths:
- Auth: `/api/auth/`
- Users: `/api/users/`

All responses use `apps/core/utils/response_wrapper.py::api_response()` format.

## Auth

- POST `/api/auth/register/admin/`
  - Registers a Company and its Admin user, sends OTP to admin email.
  - Body: `{company_name, country, default_currency, admin_name, admin_email, password, employee_id}`
  - Response: `{ user: <payload> }`

- POST `/api/auth/otp/request/`
  - Issues an OTP for `email_verification` or `password_reset`.
  - Body: `{ email, purpose }`

- POST `/api/auth/otp/verify/`
  - Verifies OTP. If `purpose=email_verification`, sets `is_email_verified=true` on the user.
  - Body: `{ email, purpose, code }`

- POST `/api/auth/login/`
  - Logs in with email/password, returns JWT tokens.
  - Body: `{ email, password }`
  - Response: user payload + `{ tokens: { access, refresh } }`

- POST `/api/auth/password/change/` (Auth required)
  - Body: `{ new_password }`

- POST `/api/auth/password/reset/request/`
  - Body: `{ email }`

- POST `/api/auth/password/reset/confirm/`
  - Body: `{ email, code, new_password }`

## Users (Admin only)

- GET `/api/users/`
  - List company users.

- POST `/api/users/`
  - Create user. Body: `{ name, email, employee_id, role, password?, manager_id? }`

- GET `/api/users/<user_id>/`
  - Retrieve user details.

- PATCH `/api/users/<user_id>/`
  - Partial update. Fields: `name, email, role, manager_id, is_active`.

- DELETE `/api/users/<user_id>/`
  - Soft delete the user.

- POST `/api/users/<user_id>/activate/`
  - Activate user.

- POST `/api/users/<user_id>/deactivate/`
  - Deactivate user.

## Notes

- Soft delete is implemented via `apps/core/models.BaseModel.delete()` which sets `deleted_at`.
- Global SMTP email sending is provided by `apps/core/email_service.send_email()`.
- OTP model lives in `apps/auth/models.py` (`OTP`).
- Service layer centralizes DB/business logic: `apps/users/services.py`, `apps/auth/services.py`.
- JWT provided by `rest_framework_simplejwt`. Configure lifetimes in settings if needed.
