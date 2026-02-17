// Backend API service for form submission
// Uses environment variable for deployment-specific endpoints
// Production URL is used as fallback if environment variable is not set
const API_BASE_URL = import.meta.env.VITE_FORM_ENDPOINT || "https://script.google.com/macros/s/AKfycbzPF-4tOFoz0OXn4F8Jpu1367Siux5AdUWDaKC2Dbo9aTZLbOvfdasaFkU3C6nM2czC/exec";

export const formService = {
  // Submit registration form
  async submitRegistration(formData) {
    const fd = new FormData();

    // 1. Send Names Separately (Updated)
    fd.append("firstName", formData.firstName);
    fd.append("middleName", formData.middleName || "");
    fd.append("lastName", formData.lastName);

    // 2. Standard Fields
    fd.append("email", formData.emailAddress);
    fd.append("phone", formData.phoneNo);
    fd.append("designation", formData.designation);

    // 3. Organization Logic (Consolidated)
    fd.append("orgType", formData.organizationType);
    // Checks both possible variable names to be safe
    fd.append("orgName", formData.organizationName || formData.organization || "");

    fd.append("city", formData.city);
    fd.append("programInterests", Array.isArray(formData.attendingProgram) ? formData.attendingProgram.join(", ") : formData.attendingProgram);
    fd.append("category", formData.category);

    // 4. Arrays to Strings
    fd.append("membership", (formData.membershipAffiliation || []).join(", "));
    fd.append("preferredDays", (formData.preferredDays || []).join(", "));

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // 5. Return the result (containing the ID)
      const result = await response.json();
      return result;

    } catch (error) {
      console.error("Submission error:", error);
      throw error;
    }
  },

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (basic validation)
  validatePhone(phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },
};

// Dropdown options data
export const dropdownOptions = {
  organizationTypes: [
    "Company",
    "College",
    "Startup",
  ],

  categories: [
    "Visitor",
    "Exhibitor",
    "Partner",
  ],

  membershipAffiliations: [
    "CII",
    "IDGS",
    "None",
  ],

  preferredDays: [
    "20th March 2026",
    "21st March 2026",
    "22nd March 2026",
  ],

  attendingPrograms: [
    "B2B connect",
    "Esports",
    "Exhibition",
    "Job fair",
    "Masterclass",
  ],
};