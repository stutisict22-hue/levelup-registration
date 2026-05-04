// Backend API service for the EXHIBITOR registration form (Form 2).
// VITE_FORM_ENDPOINT must point at the exhibitor Apps Script web-app URL —
// see CLAUDE.md → Backend setup. We intentionally do NOT fall back to a
// hardcoded URL: the original Form 1 fallback would silently misroute
// exhibitor submissions into the visitor sheet.
const API_BASE_URL = import.meta.env.VITE_FORM_ENDPOINT;
if (!API_BASE_URL) {
  console.error(
    "VITE_FORM_ENDPOINT is not set — copy .env.example to .env and fill it in."
  );
}

const joinList = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(", ") : arr || "");
const joinPeople = (people) =>
  (people || [])
    .filter((p) => p && (p.name || p.designation || p.email || p.mobile))
    .map((p) =>
      [p.name, p.designation, p.email, p.mobile].filter(Boolean).join(" | ")
    )
    .join("\n");

export const formService = {
  async submitRegistration(formData) {
    const fd = new FormData();

    // 1. Exhibitor (organization) details
    fd.append("companyName", formData.companyName || "");
    fd.append("address", formData.address || "");
    fd.append("city", formData.city || "");
    fd.append("state", formData.state || "");
    fd.append("pinCode", formData.pinCode || "");
    fd.append("country", formData.country || "");
    fd.append("mobile", formData.mobile || "");
    fd.append("phone", formData.phone || "");
    fd.append("email", formData.email || "");
    fd.append("website", formData.website || "");
    fd.append("gstNo", formData.gstNo || "");
    fd.append("panNo", formData.panNo || "");
    fd.append("ciiMembershipNo", formData.ciiMembershipNo || "");
    fd.append("idgsMembershipNo", formData.idgsMembershipNo || "");

    // 2. Exhibits & group companies (lists -> comma-separated)
    fd.append("exhibits", joinList(formData.exhibits));
    fd.append("groupCompanies", joinList(formData.groupCompanies));

    // 3. Founder
    fd.append("founderName", formData.founderName || "");
    fd.append("founderDesignation", formData.founderDesignation || "");
    fd.append("founderEmail", formData.founderEmail || "");
    fd.append("founderMobile", formData.founderMobile || "");

    // 4. Delegates (newline-separated "name | designation | email | mobile")
    fd.append("delegates", joinPeople(formData.delegates));

    // 5. Profile of organisation
    fd.append("orgProfile", formData.orgProfile || "");

    // 6. Catalogue advertisement (multi-select ids -> comma-separated)
    fd.append("catalogueAds", joinList(formData.catalogueAds));

    // 7. Stall booking (single id, legacy) + floor-plan selection.
    // selectedRooms: array of { id, sqft, floor } from FloorPlanSelector.
    // We send a comma-separated id list, total sqft, and the raw JSON for
    // the Apps Script to fan out into columns later.
    fd.append("stallSize", formData.stallSize || "");
    const rooms = Array.isArray(formData.selectedRooms) ? formData.selectedRooms : [];
    fd.append("selectedRoomIds", rooms.map((r) => r.id).join(", "));
    fd.append(
      "selectedRoomsDetail",
      rooms.map((r) => `${r.id} (${r.floor}, ${r.sqft} sq ft)`).join("\n")
    );
    fd.append(
      "totalSqft",
      String(rooms.reduce((s, r) => s + (Number(r.sqft) || 0), 0))
    );
    fd.append(
      "totalPrice",
      String(
        rooms.reduce((s, r) => s + (getStallPrice(r.sqft) || 0), 0)
      )
    );
    fd.append("selectedRoomsJson", JSON.stringify(rooms));

    // 8. Acknowledgement (declaration block from printed contract)
    fd.append("bankDraftNo", formData.bankDraftNo || "");
    fd.append("bankDraftDate", formData.bankDraftDate || "");
    fd.append("paymentCurrency", formData.paymentCurrency || "");
    fd.append("paymentAmount", formData.paymentAmount || "");
    fd.append("contractDate", formData.contractDate || "");
    fd.append("signatoryName", formData.signatoryName || "");
    fd.append("signatoryDesignation", formData.signatoryDesignation || "");
    fd.append("signature", formData.signature || "");
    fd.append("rulesAccepted", formData.agreedToRules ? "Yes" : "No");

    // 9. Company seal image (Base64 Data URL + filename)
    fd.append("companySeal", formData.companySeal || "");
    if (formData.companySealFile) {
      const ext = formData.companySealFile.name.split(".").pop();
      const safe = (formData.companyName || "exhibitor").trim().replace(/\s+/g, "_");
      fd.append("companySealName", `${safe}_seal.${ext}`);
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return await response.json();
    } catch (error) {
      console.error("Submission error:", error);
      throw error;
    }
  },

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone(phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  // At least 10 digits after stripping non-digits, max 15 (E.164-friendly).
  validateMobile(mobile) {
    const digits = String(mobile || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  },

  // Indian pin code: exactly 6 digits, first digit 1-9.
  // For other countries, accept 3-10 alphanumerics.
  validatePinCode(pin, country = "India") {
    const value = String(pin || "").trim();
    if (/^india$/i.test(country)) return /^[1-9][0-9]{5}$/.test(value);
    return /^[A-Za-z0-9\s-]{3,10}$/.test(value);
  },

  // Standard Indian GSTIN: 15 chars — 2 digits state, 5 letters PAN, 4 digits, 1 letter,
  // 1 alphanum, 'Z', 1 alphanum.
  validateGST(gst) {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(gst || "").trim());
  },

  // Indian PAN: 5 letters, 4 digits, 1 letter.
  validatePAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(pan || "").trim());
  },

  // Lenient: must contain a dot and no whitespace. Optional http(s):// prefix.
  validateWebsite(url) {
    const value = String(url || "").trim();
    if (!value) return true;
    return /^(https?:\/\/)?[^\s.]+\.[^\s]+$/.test(value);
  },
};

// Stall sizes from the Exhibition Rates table. `id` is what gets stored in the
// sheet; `label` / `subLabel` / `price` are display only.
export const stallOptions = [
  { id: "stall_6sqm", label: "Stall — 6 sqm", subLabel: "64 sq ft", price: "₹12,000" },
  { id: "stall_7sqm", label: "Stall — 7 sqm", subLabel: "72 sq ft", price: "₹15,000" },
  { id: "stall_13sqm", label: "Stall — 13 sqm", subLabel: "144 sq ft", price: "₹25,000" },
  { id: "stall_18_20sqm", label: "Stall — 18 sqm / 20 sqm", subLabel: "192 / 216 sq ft", price: "₹35,000" },
  { id: "stall_27sqm", label: "Stall — 27 sqm", subLabel: "288 sq ft", price: "₹40,000" },
  { id: "academic", label: "Academic Institution", subLabel: "Special rate", price: "₹15,000" },
];

// Per-stall pricing keyed by sqft, taken from the Exhibition Rates card.
// Sizes not listed here (80, 120, 396, 432 sq ft from the floor plan) currently
// have no published rate — the UI shows "Price on request" for them.
export const STALL_PRICE_BY_SQFT = {
  64: 12000,
  72: 15000,
  144: 25000,
  192: 35000,
  216: 35000,
  288: 40000,
};

export const getStallPrice = (sqft) => {
  const n = Number(sqft);
  if (!n) return null;
  return STALL_PRICE_BY_SQFT[n] ?? null;
};

export const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const catalogueAdOptions = [
  { id: "colour_full_page", label: "Colour Full Page", price: "₹10,000 / $300" },
  { id: "back_cover", label: "Back Cover", price: "₹20,000 / $400" },
  { id: "inside_front_cover", label: "Inside Front Cover", price: "₹15,000 / $250" },
  { id: "inside_back_cover", label: "Inside Back Cover", price: "₹15,000 / $250" },
];
