# Student Onboarding Testing Workflow Guide

This document outlines the recommended testing workflow for the student onboarding process in UnibenServices. Use this as a reference for implementing and maintaining robust tests across the stack.

---

## 1. End-to-End (E2E) User Flow
- **Sign Up:** User registers with email, name, and password.
- **Onboarding:** User completes onboarding as a student:
  - Inputs: Matric number, department, level, and ID card upload.
  - Validation: All fields required and validated on frontend and backend.
  - File Upload: ID card uploaded to Supabase Storage; URL stored in DB.
- **Submission:** Data sent to backend API (`/onboarding/register`).
- **Backend Processing:** Backend validates all fields, checks for duplicate matric numbers, and stores data.
- **Admin Review:** Admin can view, approve, or reject onboarding submissions.
- **Notifications:** User receives feedback (success, error, or admin decision).

---

## 2. Types of Tests to Implement

### Unit Tests
- **Frontend:**
  - Form validation logic (matric number format, required fields, file type/size).
  - UI state changes (loading, error, success).
- **Backend:**
  - Zod schema validation for all required fields.
  - Duplicate matric number check.
  - Required file presence (`studentIdCard`).
  - Error handling for invalid/missing data.

### Integration Tests
- **API Endpoints:**
  - POST `/onboarding/register` with valid and invalid payloads.
  - Ensure correct error codes/messages for missing/invalid fields.
  - Ensure successful onboarding stores all data correctly.
- **File Upload:**
  - Simulate file upload and check storage integration.
  - Ensure uploaded file URL is saved and accessible.

### End-to-End (E2E) Tests
- **User Perspective:**
  - Simulate a user signing up, completing onboarding, uploading an ID card, and submitting.
  - Verify errors for missing/invalid fields.
  - Verify successful onboarding leads to correct user state.
- **Admin Perspective:**
  - Simulate admin reviewing, approving, or rejecting onboarding submissions.
  - Verify user status updates and notifications are sent.

### Edge Cases & Security
- Submitting duplicate matric numbers.
- Uploading invalid file types or oversized files.
- Attempting to bypass required fields (e.g., via API).
- Ensuring only authenticated users can access onboarding.
- Ensuring only admins can review/approve onboarding.

---

## 3. Recommended Tools & Practices
- **Unit/Integration:** Use Jest or Vitest for backend and frontend logic.
- **E2E:** Use Playwright or Cypress to simulate real user flows in the browser.
- **Mocking:** Mock Supabase Storage and email sending in tests to avoid real side effects.
- **Fixtures:** Use test users and test files for repeatable scenarios.
- **Assertions:** Check for correct UI feedback, API responses, and database state.

---

## 4. Testing Workflow Summary
1. Write unit tests for all validation and logic (frontend and backend).
2. Write integration tests for API endpoints, including file upload and error handling.
3. Write E2E tests to simulate the full onboarding process from both user and admin perspectives.
4. Test edge cases and security to ensure robustness.
5. Automate tests to run on every commit/PR for continuous quality.

---

**Keep this file updated as the onboarding process or requirements evolve.**
