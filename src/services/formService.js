// Backend API service for form submission
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbxW9XRHoiXNyK4Hrv6VK9Pf2Ja9T21vd6APvslWHO3ReoVSbVSlrvL5TcFg0brvB9oa/exec";

export const formService = {
  // Submit registration form
  async submitRegistration(formData) {
    const fd = new FormData();
    const fullName = `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim();
    fd.append("fullName", fullName);
    fd.append("email", formData.emailAddress);
    fd.append("phone", formData.phoneNo);
    fd.append("designation", formData.designation);
    fd.append("organization", formData.organization || ""); // Added for mobile
    fd.append("orgType", formData.organizationType);
    fd.append("city", formData.city);
    fd.append("programInterests", formData.attendingProgram);
    fd.append("category", formData.category);
    fd.append("membership", (formData.membershipAffiliation || []).join(", "));
    fd.append("preferredDays", (formData.preferredDays || []).join(", "));

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      body: fd,
    });
    if (!response.ok) {
      throw new Error("Failed to submit registration");
    }
    return await response.json();
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
  ],

  preferredDays: [
    "20th March 2026",
    "21st March 2026",
    "22nd March 2026",
  ],
};
