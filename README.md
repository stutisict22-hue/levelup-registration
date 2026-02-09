# LevelUp Northeast 2026 Registration Portal (Event2)

## Overview
**Event2** is a specialized web application designed to handle participant registrations for the **LevelUp Northeast 2026** event. Built with **React** and styled using **Tailwind CSS**, it features a highly customized, dark-themed user interface that aligns with the event's gaming and esports branding.

The application manages the entire registration lifecycle: from data entry and validation to image uploading and generating unique registration IDs.

---

## Project Structure & File Details

This project relies on three core files to function. Below is an in-depth breakdown of each file and the code logic included within them.

### 1. `src/page/index.jsx` (The Main Controller)
This is the primary view component where the UI is rendered and state is managed.

*   **State Management:**
    *   `formData`: Stores all user inputs (names, email, dropdown selections).
    *   `errors`: Tracks validation messages for specific fields.
    *   `profileImage`: Stores the Base64 string of the uploaded user photo.
    *   `registrationId`: Holds the unique ID generated after successful submission.
*   **Key Logic:**
    *   **`generateRegistrationId()`**: Creates a unique ID formatted as `IDGES2026_02XXXX`. It checks `localStorage` to ensure the random 4-digit suffix hasn't been used before.
    *   **`handleImageUpload()`**: Intercepts file selection, enforces a **5MB limit**, and uses `FileReader` to create a preview.
    *   **`validateForm()`**: Runs a suite of checks (required fields, regex patterns) before allowing submission.
    *   **`handleSubmit()`**: The orchestrator function that triggers validation, calls the service layer, and manages the success modal.
*   **Layout:**
    *   Uses **Tailwind CSS arbitrary values** (e.g., `top-[160px]`, `left-[100px]`) to achieve a pixel-perfect layout that matches a specific design mockup.
    *   Includes absolute positioning for background assets and form containers.

### 2. `src/services/formService.js` (The Logic & Data Layer)
This file acts as the bridge between the frontend UI and the backend (simulated).

*   **`formService` Object:**
    *   **`submitRegistration(formData)`**: Currently simulates an asynchronous API call using `setTimeout` (500ms delay). It contains commented-out code ready for a real `fetch` request to an API endpoint.
    *   **`validateEmail(email)`**: Uses Regex to ensure emails follow standard formats (e.g., `user@domain.com`).
    *   **`validatePhone(phone)`**: Uses Regex to validate phone numbers, supporting international codes.
*   **`dropdownOptions` Object:**
    *   Exports static arrays used to populate the UI dropdowns.
    *   **Data:** `organizationTypes`, `categories`, `membershipAffiliations`, and `preferredDays`.

### 3. `src/components/FormDropdown.jsx` (Reusable UI Component)
A custom-built dropdown component designed to replace the standard HTML `<select>` element for better styling control.

*   **Features:**
    *   **Multi-Select Support:** If `multiSelect={true}`, users can pick multiple options (e.g., for "Preferred Days").
    *   **Click-Outside Detection:** Uses `useRef` and `useEffect` to close the dropdown menu when the user clicks elsewhere on the page.
*   **Styling:**
    *   Dark theme compatible (`bg-[#23282e]`).
    *   Custom scrollbars and hover effects (`hover:bg-[#30dfa0]`).

---

## Detailed Workflow: How It Works

### Step 1: Initialization
*   The application loads `Main` (`index.jsx`).
*   `useState` initializes the form with empty strings.
*   `dropdownOptions` are imported from `formService.js` to populate the select menus.

### Step 2: Data Entry
*   **Text Input:** As the user types, `handleInputChange` updates the state and clears specific field errors.
*   **Dropdowns:** Clicking a dropdown toggles `isOpen` in `FormDropdown.jsx`. Selecting an option updates the parent state via the `onChange` prop.
*   **Image Upload:**
    1.  User clicks the profile circle.
    2.  A hidden `<input type="file">` is triggered.
    3.  If the file is valid (<5MB), it is converted to a Data URL and displayed immediately.

### Step 3: Validation (On Submit)
*   User clicks the **Submit** button.
*   `validateForm` executes:
    *   Checks if required fields are empty.
    *   Calls `formService.validateEmail` and `validatePhone`.
    *   Verifies the "Terms and Conditions" checkbox.
*   **Failure:** If any check fails, `errors` state is populated, and red error text appears below the invalid fields.

### Step 4: Submission & Processing
*   **Success:** If validation passes:
    1.  `isSubmitting` is set to `true` (Button text changes to "Submitting...").
    2.  `formService.submitRegistration` is awaited.
    3.  The mock service waits 500ms and returns success.

### Step 5: Completion
*   **ID Generation:** `generateRegistrationId` creates a new ID (e.g., `IDGES2026_029999`) and saves it to `localStorage` to prevent duplicates.
*   **Modal:** `showSuccessModal` becomes `true`, displaying the green checkmark and the new ID.
*   **Reset:** The form fields are cleared, ready for the next user.

---

## Configuration & Setup

### Connecting to a Real API
To switch from the mock backend to a real server:

1.  Open `src/services/formService.js`.
2.  Update `API_BASE_URL` with your actual endpoint.
3.  Uncomment the `fetch` logic inside `submitRegistration` and remove the `setTimeout` block.

```javascript
// src/services/formService.js
const API_BASE_URL = "https://your-api.com/v1";
```

### Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm start
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

---

## Technical Notes
- **Responsive Design:** The current layout uses fixed pixel widths (`w-[1440px]`) optimized for desktop views based on specific design assets. Mobile responsiveness would require adjusting these absolute positions to relative flex/grid layouts.
- **Assets:** Background images and icons are hosted on AWS S3 and referenced directly in the CSS/JSX.