import React, { useState, useRef, useEffect } from "react";
import "./index.css";
import "../styles/globals.css";
import FormInput from "../components/FormInput";
import SectionCard from "../components/SectionCard";
import DynamicList from "../components/DynamicList";
import StallSelector from "../components/StallSelector";
import WordCountTextarea from "../components/WordCountTextarea";
import CatalogueAdGroup from "../components/CatalogueAdGroup";
import RulesModal from "../components/RulesModal";
import FloorPlanSelector from "../components/FloorPlanSelector";
import zoneConfig from "../data/levelup-zones-cleaned.json";
import {
  formService,
  stallOptions,
  catalogueAdOptions,
  getStallPrice,
  formatINR,
} from "../services/formService";
import { compressImage } from "../services/imageCompressor";

const blankDelegate = () => ({
  name: "",
  designation: "",
  email: "",
  mobile: "",
});

const initialFormData = {
  // Exhibitor details
  companyName: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  country: "India",
  mobile: "",
  phone: "",
  email: "",
  website: "",
  gstNo: "",
  panNo: "",
  ciiMembershipNo: "",
  idgsMembershipNo: "",
  // Lists
  exhibits: ["", ""],
  groupCompanies: ["", ""],
  delegates: [blankDelegate()],
  // Founder
  founderName: "",
  founderDesignation: "",
  founderEmail: "",
  founderMobile: "",
  // Profile + ads
  orgProfile: "",
  catalogueAds: [],
  // Stall
  stallSize: "",
  // Floor-plan selection (replaces stallSize as the live picker — kept above
  // for backward-compat with the existing Apps Script column).
  selectedRooms: [], // [{ id, sqft, floor }, ...]
  // Acknowledgement (declaration block from printed contract)
  bankDraftNo: "",
  bankDraftDate: "",
  paymentCurrency: "INR",
  paymentAmount: "",
  contractDate: "",
  signatoryName: "",
  signatoryDesignation: "",
  signature: "",
  agreedToRules: false,
};

export default function Main() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [companySeal, setCompanySeal] = useState(null);
  const [companySealFile, setCompanySealFile] = useState(null);
  const sealInputRef = useRef(null);
  const floorPlanRef = useRef(null);

  // Dev shortcut: `#page-2` jumps to the rest of the form, `#page-3` /
  // `#floorplan` jumps to the map.
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#page-2") setCurrentPage(2);
    else if (hash === "#floorplan" || hash === "#page-3") setCurrentPage(3);
  }, []);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
    setSubmitStatus(null);
  };

  const handleInput = (key) => (e) => setField(key, e.target.value);

  // Input transforms — restrict at the keystroke so the value stays valid.
  const handleDigitsOnly = (key, max) => (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, max);
    setField(key, v);
  };
  const handleMobileInput = (key) => (e) => {
    // Allow digits, +, space, -, (, ) — common phone characters.
    const v = e.target.value.replace(/[^\d+\-\s()]/g, "").slice(0, 20);
    setField(key, v);
  };
  const handleUpperAlnum = (key, max) => (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, max);
    setField(key, v);
  };

  const handleSealUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitStatus({ type: "error", message: "Seal image must be under 5MB." });
      return;
    }
    const compressed = await compressImage(file);
    setCompanySealFile(compressed);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanySeal(reader.result);
      setSubmitStatus(null);
    };
    reader.readAsDataURL(compressed);
  };

  const updateDelegate = (idx, key, value) => {
    setFormData((prev) => {
      const next = [...prev.delegates];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, delegates: next };
    });
    setErrors((prev) => {
      if (!prev.delegates?.[idx]?.[key]) return prev;
      const nextDelegates = [...prev.delegates];
      nextDelegates[idx] = { ...nextDelegates[idx], [key]: "" };
      return { ...prev, delegates: nextDelegates };
    });
    setSubmitStatus(null);
  };

  // Validates only the Exhibitor Details fields (page 1).
  const validatePage1 = () => {
    const e = {};
    const required = (k, label) => {
      if (!String(formData[k] || "").trim()) e[k] = `${label} is required`;
    };

    required("companyName", "Company / Organization");
    required("address", "Address");
    required("city", "City");
    required("state", "State");
    required("pinCode", "Pin Code");
    required("country", "Country");
    required("mobile", "Mobile");
    required("email", "Email");
    if (formData.email && !formService.validateEmail(formData.email)) {
      e.email = "Invalid email format";
    }
    if (formData.mobile && !formService.validateMobile(formData.mobile)) {
      e.mobile = "Enter a valid mobile (at least 10 digits)";
    }
    if (
      formData.pinCode &&
      !formService.validatePinCode(formData.pinCode, formData.country)
    ) {
      e.pinCode = /^india$/i.test(formData.country)
        ? "Pin Code must be 6 digits"
        : "Invalid Pin Code";
    }
    if (!formData.gstNo.trim() && !formData.panNo.trim()) {
      e.gstNo = "Provide GST or PAN";
      e.panNo = "Provide GST or PAN";
    } else {
      if (formData.gstNo.trim() && !formService.validateGST(formData.gstNo)) {
        e.gstNo = "Invalid GST format (e.g. 29ABCDE1234F1Z5)";
      }
      if (formData.panNo.trim() && !formService.validatePAN(formData.panNo)) {
        e.panNo = "Invalid PAN format (e.g. ABCDE1234F)";
      }
    }
    if (formData.website && !formService.validateWebsite(formData.website)) {
      e.website = "Invalid website URL";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Page 2 = Exhibits, Group Companies, Founder, Delegates, Org Profile,
  // Acknowledgement (rules + signatory + seal + payment declaration).
  const validatePage2 = () => {
    const e = {};
    const required = (k, label) => {
      if (!String(formData[k] || "").trim()) e[k] = `${label} is required`;
    };

    if (!formData.exhibits.some((x) => String(x || "").trim())) {
      e.exhibits = "List at least one exhibit";
    }

    required("founderName", "Founder name");
    required("founderEmail", "Founder email");
    if (formData.founderEmail && !formService.validateEmail(formData.founderEmail)) {
      e.founderEmail = "Invalid email format";
    }
    if (
      formData.founderMobile &&
      !formService.validateMobile(formData.founderMobile)
    ) {
      e.founderMobile = "Enter a valid mobile (at least 10 digits)";
    }

    const delegateErrors = formData.delegates.map((d) => {
      const filled =
        d.name.trim() || d.designation.trim() || d.email.trim() || d.mobile.trim();
      if (!filled) return null;
      const row = {};
      if (!d.name.trim()) row.name = "Name is required";
      if (!d.email.trim()) {
        row.email = "Email is required";
      } else if (!formService.validateEmail(d.email)) {
        row.email = "Invalid email format";
      }
      if (d.mobile.trim() && !formService.validateMobile(d.mobile)) {
        row.mobile = "Invalid mobile";
      }
      return Object.keys(row).length ? row : null;
    });
    if (delegateErrors.some(Boolean)) {
      e.delegates = delegateErrors;
    }

    if (!formData.orgProfile.trim()) {
      e.orgProfile = "Organisation profile is required";
    }

    required("signatoryName", "Signatory name");
    required("signatoryDesignation", "Signatory designation");
    required("signature", "Signature");
    required("contractDate", "Date");
    if (formData.contractDate && new Date(formData.contractDate) > new Date()) {
      e.contractDate = "Date cannot be in the future";
    }

    const draftTouched =
      formData.bankDraftNo.trim() ||
      formData.bankDraftDate.trim() ||
      formData.paymentAmount.toString().trim();
    if (draftTouched) {
      if (!formData.bankDraftNo.trim()) {
        e.bankDraftNo = "Bank Draft / Remittance reference is required";
      }
      if (!formData.bankDraftDate.trim()) {
        e.bankDraftDate = "Bank Draft date is required";
      } else if (new Date(formData.bankDraftDate) > new Date()) {
        e.bankDraftDate = "Date cannot be in the future";
      }
      if (!formData.paymentAmount.toString().trim()) {
        e.paymentAmount = "Amount is required";
      } else if (
        Number.isNaN(Number(formData.paymentAmount)) ||
        Number(formData.paymentAmount) <= 0
      ) {
        e.paymentAmount = "Amount must be a positive number";
      }
    }

    if (!formData.agreedToRules) {
      e.agreedToRules = "You must read and accept the General Exhibitor Rules";
    }
    if (!companySeal) {
      e.companySeal = "Company Seal image is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validatePage1()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the highlighted fields before continuing.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitStatus(null);
    setCurrentPage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueToPage3 = () => {
    // Rules acceptance is required (button is disabled otherwise), but
    // defend against bypass anyway.
    if (!formData.agreedToRules) {
      setErrors((prev) => ({
        ...prev,
        agreedToRules: "You must read and accept the General Exhibitor Rules",
      }));
      setSubmitStatus({
        type: "error",
        message: "Please read and accept the General Exhibitor Rules.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!validatePage2()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the highlighted fields before continuing.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitStatus(null);
    setCurrentPage(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setSubmitStatus(null);
    setCurrentPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateForm = () => {
    const e = {};
    const required = (k, label) => {
      if (!String(formData[k] || "").trim()) e[k] = `${label} is required`;
    };

    // Exhibitor details
    required("companyName", "Company / Organization");
    required("address", "Address");
    required("city", "City");
    required("state", "State");
    required("pinCode", "Pin Code");
    required("country", "Country");
    required("mobile", "Mobile");
    required("email", "Email");
    if (formData.email && !formService.validateEmail(formData.email)) {
      e.email = "Invalid email format";
    }
    if (formData.mobile && !formService.validateMobile(formData.mobile)) {
      e.mobile = "Enter a valid mobile (at least 10 digits)";
    }
    if (
      formData.pinCode &&
      !formService.validatePinCode(formData.pinCode, formData.country)
    ) {
      e.pinCode = /^india$/i.test(formData.country)
        ? "Pin Code must be 6 digits"
        : "Invalid Pin Code";
    }
    if (!formData.gstNo.trim() && !formData.panNo.trim()) {
      e.gstNo = "Provide GST or PAN";
      e.panNo = "Provide GST or PAN";
    } else {
      if (formData.gstNo.trim() && !formService.validateGST(formData.gstNo)) {
        e.gstNo = "Invalid GST format (e.g. 29ABCDE1234F1Z5)";
      }
      if (formData.panNo.trim() && !formService.validatePAN(formData.panNo)) {
        e.panNo = "Invalid PAN format (e.g. ABCDE1234F)";
      }
    }
    if (formData.website && !formService.validateWebsite(formData.website)) {
      e.website = "Invalid website URL";
    }

    // Exhibits — at least one non-empty
    if (!formData.exhibits.some((x) => String(x || "").trim())) {
      e.exhibits = "List at least one exhibit";
    }

    // Founder
    required("founderName", "Founder name");
    required("founderEmail", "Founder email");
    if (formData.founderEmail && !formService.validateEmail(formData.founderEmail)) {
      e.founderEmail = "Invalid email format";
    }
    if (
      formData.founderMobile &&
      !formService.validateMobile(formData.founderMobile)
    ) {
      e.founderMobile = "Enter a valid mobile (at least 10 digits)";
    }

    // Delegates — if a row has any data, name + valid email required; mobile if filled
    const delegateErrors = formData.delegates.map((d) => {
      const filled =
        d.name.trim() || d.designation.trim() || d.email.trim() || d.mobile.trim();
      if (!filled) return null;
      const row = {};
      if (!d.name.trim()) row.name = "Name is required";
      if (!d.email.trim()) {
        row.email = "Email is required";
      } else if (!formService.validateEmail(d.email)) {
        row.email = "Invalid email format";
      }
      if (d.mobile.trim() && !formService.validateMobile(d.mobile)) {
        row.mobile = "Invalid mobile";
      }
      return Object.keys(row).length ? row : null;
    });
    if (delegateErrors.some(Boolean)) {
      e.delegates = delegateErrors;
    }

    // Profile
    if (!formData.orgProfile.trim()) {
      e.orgProfile = "Organisation profile is required";
    }

    // Acknowledgement
    required("signatoryName", "Signatory name");
    required("signatoryDesignation", "Signatory designation");
    required("signature", "Signature");
    required("contractDate", "Date");
    if (formData.contractDate && new Date(formData.contractDate) > new Date()) {
      e.contractDate = "Date cannot be in the future";
    }

    // Bank-draft declaration: optional as a whole, but if any field is filled,
    // require the trio (no, date, amount) — matches the printed contract.
    const draftTouched =
      formData.bankDraftNo.trim() ||
      formData.bankDraftDate.trim() ||
      formData.paymentAmount.toString().trim();
    if (draftTouched) {
      if (!formData.bankDraftNo.trim()) {
        e.bankDraftNo = "Bank Draft / Remittance reference is required";
      }
      if (!formData.bankDraftDate.trim()) {
        e.bankDraftDate = "Bank Draft date is required";
      } else if (new Date(formData.bankDraftDate) > new Date()) {
        e.bankDraftDate = "Date cannot be in the future";
      }
      if (!formData.paymentAmount.toString().trim()) {
        e.paymentAmount = "Amount is required";
      } else if (
        Number.isNaN(Number(formData.paymentAmount)) ||
        Number(formData.paymentAmount) <= 0
      ) {
        e.paymentAmount = "Amount must be a positive number";
      }
    }

    if (!formData.agreedToRules) {
      e.agreedToRules = "You must read and accept the General Exhibitor Rules";
    }
    if (!companySeal) {
      e.companySeal = "Company Seal image is required";
    }
    if (!formData.selectedRooms?.length) {
      e.selectedRooms = "Select at least one stall on the floor plan";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the highlighted fields before submitting.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await formService.submitRegistration({
        ...formData,
        companySeal,
        companySealFile,
      });

      const ok =
        (response && response.result === "success") ||
        (response && response.id && response.result !== "error");

      if (ok) {
        // Registration captured — hand off to CII's payment page.
        window.location.href =
          "https://cam.mycii.in/ORNew/Registration.html?EventId=E000070765";
        return;
      }

      if (response && response.result === "error") {
        setSubmitStatus({
          type: "error",
          message: response.message || "Submission failed.",
        });
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to submit registration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Full-screen background image (desktop / mobile via media query) */}
      <div className="page-bg fixed inset-0 z-0" />

      {/* Inset dark rounded card wrapper (matches Form 1's outer frame) */}
      <div className="relative z-10 mx-[20px] md:mx-[40px] my-[15px] md:my-[30px] bg-[#0A1830]/70 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Header — full overlay width, logos flush to edges and lifted above */}
        <header className="grid grid-cols-3 items-center gap-4 -mt-32 md:-mt-64 pt-3 md:pt-[100px] px-4 md:px-6">
          <a
            href="https://www.cii.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="justify-self-start mt-4 md:mt-6"
          >
            <img
              src="./CII Logo.png"
              alt="CII"
              className="h-8 md:h-14 object-contain"
            />
          </a>
          <div className="justify-self-center mt-32 md:mt-[130px]">
            <img
              src="./White.png"
              alt="LevelUp Northeast"
              className="h-[28rem] md:h-[48rem] object-contain pointer-events-none -my-28 md:-my-64"
            />
          </div>
          <a
            href="https://gamingsociety.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="justify-self-end mt-4 md:mt-6"
          >
            <img
              src="./assets/IDGS%20Logo.png"
              alt="IDGS"
              className="h-11 md:h-16 object-contain"
            />
          </a>
        </header>

        <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-6">
        {submitStatus && (
          <div
            className={`relative z-10 mt-4 mb-4 px-5 py-3 rounded-[12px] font-['Montserrat'] text-[13px] text-center ${
              submitStatus.type === "success"
                ? "bg-green-500/20 border border-green-400 text-green-100"
                : "bg-red-500/20 border border-red-400 text-red-100"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Form sections */}
        <main className={`flex flex-col gap-5 md:gap-6 ${submitStatus ? "" : "-mt-2 md:-mt-6"}`}>
        {currentPage === 1 && (<>
          {/* 1. Exhibitor Details */}
          <SectionCard title="Exhibitor Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Company / Organization"
                  required
                  value={formData.companyName}
                  onChange={handleInput("companyName")}
                  placeholder="Company / Organization"
                  error={errors.companyName}
                  labelColor="text-[rgb(10,24,48)]"
                />
              </div>
              <div className="md:col-span-2">
                <FormInput
                  label="Address"
                  required
                  value={formData.address}
                  onChange={handleInput("address")}
                  placeholder="Street address"
                  error={errors.address}
                  labelColor="text-[rgb(10,24,48)]"
                />
              </div>
              <FormInput
                label="City"
                required
                value={formData.city}
                onChange={handleInput("city")}
                placeholder="City"
                error={errors.city}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="State"
                required
                value={formData.state}
                onChange={handleInput("state")}
                placeholder="State"
                error={errors.state}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Pin Code"
                required
                value={formData.pinCode}
                onChange={handleDigitsOnly("pinCode", 10)}
                placeholder="Pin Code"
                error={errors.pinCode}
                labelColor="text-[rgb(10,24,48)]"
                inputMode="numeric"
                maxLength={10}
              />
              <FormInput
                label="Country"
                required
                value={formData.country}
                onChange={handleInput("country")}
                placeholder="Country"
                error={errors.country}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Mobile"
                required
                type="tel"
                value={formData.mobile}
                onChange={handleMobileInput("mobile")}
                placeholder="Mobile"
                error={errors.mobile}
                labelColor="text-[rgb(10,24,48)]"
                inputMode="tel"
              />
              <FormInput
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleMobileInput("phone")}
                placeholder="Phone (optional)"
                labelColor="text-[rgb(10,24,48)]"
                inputMode="tel"
              />
              <FormInput
                label="Email for Communication"
                required
                type="email"
                value={formData.email}
                onChange={handleInput("email")}
                placeholder="Email"
                error={errors.email}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Website"
                value={formData.website}
                onChange={handleInput("website")}
                placeholder="https://"
                error={errors.website}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Company GST No"
                value={formData.gstNo}
                onChange={handleUpperAlnum("gstNo", 15)}
                placeholder="29ABCDE1234F1Z5"
                error={errors.gstNo}
                labelColor="text-[rgb(10,24,48)]"
                maxLength={15}
              />
              <FormInput
                label="PAN No"
                value={formData.panNo}
                onChange={handleUpperAlnum("panNo", 10)}
                placeholder="ABCDE1234F"
                error={errors.panNo}
                labelColor="text-[rgb(10,24,48)]"
                maxLength={10}
              />
              <FormInput
                label="CII Membership No"
                value={formData.ciiMembershipNo}
                onChange={handleInput("ciiMembershipNo")}
                placeholder="CII Membership"
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="IDGS Membership No"
                value={formData.idgsMembershipNo}
                onChange={handleInput("idgsMembershipNo")}
                placeholder="IDGS Membership"
                labelColor="text-[rgb(10,24,48)]"
              />

            </div>
          </SectionCard>

          {/* Continue → Page 2 */}
          <div className="flex justify-end mt-2 mb-6">
            <button
              type="button"
              onClick={handleContinue}
              className="px-10 py-3 rounded-[40px] font-['Baloo'] text-[18px] md:text-[20px] font-bold bg-gradient-to-r from-brand-primary to-brand-accent-cyan text-[#0A1830] hover:opacity-90 cursor-pointer shadow-[0_8px_30px_rgba(56,189,248,0.45)] transition-all"
            >
              Continue →
            </button>
          </div>
        </>)}

        {currentPage === 2 && (<>
          {/* 2. Exhibit Details */}
          <SectionCard title="Exhibit Details">
            <DynamicList
              items={formData.exhibits}
              setItems={(items) => setField("exhibits", items)}
              newItem={() => ""}
              minItems={1}
              simple
              inputPlaceholder="Exhibit"
              addLabel="+ Add another exhibit"
            />
            {errors.exhibits && (
              <span className="text-[11px] font-semibold text-red-600 font-['Montserrat'] mt-2 block">
                {errors.exhibits}
              </span>
            )}
          </SectionCard>

          {/* 3. Group Companies */}
          <SectionCard title="Group Companies">
            <DynamicList
              label="Group / sister companies (if any)"
              items={formData.groupCompanies}
              setItems={(items) => setField("groupCompanies", items)}
              newItem={() => ""}
              minItems={1}
              simple
              inputPlaceholder="Group company name"
              addLabel="+ Add another company"
            />
          </SectionCard>

          {/* 4. Founder Details */}
          <SectionCard title="Founder Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Name"
                required
                value={formData.founderName}
                onChange={handleInput("founderName")}
                placeholder="Founder name"
                error={errors.founderName}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Designation"
                value={formData.founderDesignation}
                onChange={handleInput("founderDesignation")}
                placeholder="Designation"
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Email"
                required
                type="email"
                value={formData.founderEmail}
                onChange={handleInput("founderEmail")}
                placeholder="Email"
                error={errors.founderEmail}
                labelColor="text-[rgb(10,24,48)]"
              />
              <FormInput
                label="Mobile"
                required
                type="tel"
                value={formData.founderMobile}
                onChange={handleMobileInput("founderMobile")}
                placeholder="Mobile"
                error={errors.founderMobile}
                labelColor="text-[rgb(10,24,48)]"
                inputMode="tel"
              />
            </div>
          </SectionCard>

          {/* 5. Delegates */}
          <SectionCard title="Delegates Details">
            <DynamicList
              label="Delegates attending on behalf of the exhibitor"
              helper="Add a row per delegate. Each delegate gets the exhibitor pass."
              items={formData.delegates}
              setItems={(items) => setField("delegates", items)}
              newItem={blankDelegate}
              minItems={1}
              addLabel="+ Add delegate"
              renderRow={(item, idx) => {
                const rowErr = errors.delegates?.[idx] || {};
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label={`Delegate ${idx + 1} — Name`}
                      value={item.name}
                      onChange={(e) => updateDelegate(idx, "name", e.target.value)}
                      placeholder="Name"
                      error={rowErr.name}
                      labelColor="text-[rgb(10,24,48)]"
                    />
                    <FormInput
                      label="Designation"
                      value={item.designation}
                      onChange={(e) => updateDelegate(idx, "designation", e.target.value)}
                      placeholder="Designation"
                      labelColor="text-[rgb(10,24,48)]"
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      value={item.email}
                      onChange={(e) => updateDelegate(idx, "email", e.target.value)}
                      placeholder="Email"
                      error={rowErr.email}
                      labelColor="text-[rgb(10,24,48)]"
                    />
                    <FormInput
                      label="Mobile"
                      type="tel"
                      value={item.mobile}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d+\-\s()]/g, "").slice(0, 20);
                        updateDelegate(idx, "mobile", v);
                      }}
                      placeholder="Mobile"
                      error={rowErr.mobile}
                      labelColor="text-[rgb(10,24,48)]"
                      inputMode="tel"
                    />
                  </div>
                );
              }}
            />
          </SectionCard>

          {/* 6. Profile of Organisation */}
          <SectionCard title="Profile of Organisation">
            <WordCountTextarea
              label="Brief profile"
              required
              value={formData.orgProfile}
              onChange={(text) => setField("orgProfile", text)}
              placeholder="Tell us about your organisation in about 200 words..."
              error={errors.orgProfile}
            />
          </SectionCard>

          {/* Catalogue Advertisement, Stall Booking, Payment Declaration moved to next page */}

          {/* 7. Acknowledgement */}
          <SectionCard title="Acknowledgement & Signatory">
            <div className="flex flex-col gap-4">
              <div className="bg-[#0A1830] rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="grow">
                  <p className="font-['Montserrat'] text-[13px] font-semibold text-white m-0">
                    General Exhibitor Rules
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRulesModalOpen(true)}
                  className={`shrink-0 px-5 py-2 rounded-[30px] font-['Montserrat'] text-[12px] font-semibold transition-colors cursor-pointer ${
                    formData.agreedToRules
                      ? "bg-green-500 text-[#0A1830]"
                      : "bg-gradient-to-r from-brand-primary to-brand-accent-cyan text-[#0A1830] hover:opacity-90"
                  }`}
                >
                  {formData.agreedToRules ? "✓ Accepted — View Rules" : "View & Accept Rules"}
                </button>
              </div>
              {errors.agreedToRules && (
                <span className="text-[11px] font-semibold text-red-600 font-['Montserrat']">
                  {errors.agreedToRules}
                </span>
              )}

              {/* Declaration paragraph (from printed contract) */}
              <p className="font-['Montserrat'] text-[12px] leading-[18px] text-[rgb(10,24,48)] m-0">
                I / We have read the GENERAL EXHIBITOR RULES and confirm that we
                shall abide by them. Enclosed is our Bank Draft No. OR
                Remittance Advise (entered below), towards payment of rental and
                other charges in favour of{" "}
                <strong>CONFEDERATION OF INDIAN INDUSTRY</strong>, New Delhi,
                INDIA.
              </p>

              {/* Bank draft / remittance row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Bank Draft No. / Remittance Advise"
                  value={formData.bankDraftNo}
                  onChange={handleInput("bankDraftNo")}
                  placeholder="DD No. / Transaction reference"
                  error={errors.bankDraftNo}
                  labelColor="text-[rgb(10,24,48)]"
                />
                <div className="flex flex-col gap-1.5 relative">
                  <label className="font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
                    Dated
                  </label>
                  <input
                    type="date"
                    value={formData.bankDraftDate}
                    onChange={handleInput("bankDraftDate")}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full h-[33.218px] bg-[#23282e] rounded-[55.408px] px-[18.469px] font-['Montserrat'] text-[11px] text-white border-none outline-none [color-scheme:dark]"
                  />
                  {errors.bankDraftDate && (
                    <span className="text-[11px] font-semibold text-red-600 font-['Montserrat'] absolute top-full left-0 mt-[2px]">
                      {errors.bankDraftDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Currency + amount row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
                    For
                  </label>
                  <div className="flex gap-2">
                    {["INR", "USD"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setField("paymentCurrency", c)}
                        className={`flex-1 py-2 rounded-[12px] font-['Montserrat'] text-[12px] font-semibold transition-colors cursor-pointer ${
                          formData.paymentCurrency === c
                            ? "bg-brand-primary text-[#0A1830]"
                            : "bg-[#23282e] text-white hover:bg-[#2e353d]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <FormInput
                  label="Amount"
                  type="number"
                  value={formData.paymentAmount}
                  onChange={handleInput("paymentAmount")}
                  placeholder="Amount"
                  error={errors.paymentAmount}
                  labelColor="text-[rgb(10,24,48)]"
                  inputMode="decimal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Signatory Name"
                  required
                  value={formData.signatoryName}
                  onChange={handleInput("signatoryName")}
                  placeholder="Name"
                  error={errors.signatoryName}
                  labelColor="text-[rgb(10,24,48)]"
                />
                <FormInput
                  label="Signatory Designation"
                  required
                  value={formData.signatoryDesignation}
                  onChange={handleInput("signatoryDesignation")}
                  placeholder="Designation"
                  error={errors.signatoryDesignation}
                  labelColor="text-[rgb(10,24,48)]"
                />
                <FormInput
                  label="Signature (type your full name)"
                  required
                  value={formData.signature}
                  onChange={handleInput("signature")}
                  placeholder="Type your full name as signature"
                  error={errors.signature}
                  labelColor="text-[rgb(10,24,48)]"
                />
                <div className="flex flex-col gap-1.5 relative">
                  <label className="flex items-center gap-1 font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
                    Date
                    <span className="text-red-600 text-[14px] leading-[16px]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.contractDate}
                    onChange={handleInput("contractDate")}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full h-[33.218px] bg-[#23282e] rounded-[55.408px] px-[18.469px] font-['Montserrat'] text-[11px] text-white border-none outline-none [color-scheme:dark]"
                  />
                  {errors.contractDate && (
                    <span className="text-[11px] font-semibold text-red-600 font-['Montserrat'] absolute top-full left-0 mt-[2px]">
                      {errors.contractDate}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1 font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
                    Company Seal
                    <span className="text-red-600 text-[14px] leading-[16px]">*</span>
                  </label>
                  <input
                    ref={sealInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSealUpload}
                  />
                  <div
                    onClick={() => sealInputRef.current?.click()}
                    className={`h-[110px] rounded-[16px] border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                      errors.companySeal
                        ? "border-red-500 bg-red-500/10"
                        : companySeal
                        ? "border-brand-primary bg-[#0A1830]"
                        : "border-[#0A1830]/40 bg-[#23282e] hover:border-brand-primary"
                    }`}
                  >
                    {companySeal ? (
                      <img
                        src={companySeal}
                        alt="Company seal preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-['Montserrat'] text-[11px] text-white opacity-70">
                        Click to upload company seal (≤ 5MB)
                      </span>
                    )}
                  </div>
                  {errors.companySeal && (
                    <span className="text-[11px] font-semibold text-red-600 font-['Montserrat']">
                      {errors.companySeal}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Back / Continue → Page 3 (map). Locked until rules accepted. */}
          <div className="flex justify-between items-center mt-2 mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-10 py-3 rounded-[40px] font-['Baloo'] text-[18px] md:text-[20px] font-bold bg-gradient-to-r from-brand-primary to-brand-accent-cyan text-[#0A1830] hover:opacity-90 cursor-pointer shadow-[0_8px_30px_rgba(56,189,248,0.45)] transition-all"
            >
              ← Back
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleContinueToPage3}
                disabled={!formData.agreedToRules}
                className={`px-10 py-3 rounded-[40px] font-['Baloo'] text-[18px] md:text-[20px] font-bold transition-all ${
                  formData.agreedToRules
                    ? "bg-gradient-to-r from-brand-primary to-brand-accent-cyan text-[#0A1830] hover:opacity-90 cursor-pointer shadow-[0_8px_30px_rgba(56,189,248,0.45)]"
                    : "bg-[#23282e] text-[#777] cursor-not-allowed"
                }`}
              >
                Continue →
              </button>
              {!formData.agreedToRules && (
                <span className="font-['Montserrat'] text-[11px] text-white/70">
                  Accept the General Exhibitor Rules to continue.
                </span>
              )}
            </div>
          </div>
        </>)}

        {currentPage === 3 && (<>
          <SectionCard title="Stall Selection">
            <div className="flex flex-col gap-3">
              <FloorPlanSelector
                ref={floorPlanRef}
                config={zoneConfig}
                unavailableRooms={[]}
                onChange={(rooms) => setField("selectedRooms", rooms)}
                getPrice={getStallPrice}
              />

              {/* Selection summary */}
              <div className="bg-[#0A1830] rounded-[14px] p-4 flex flex-col gap-2">
                <p className="font-['Montserrat'] text-[12px] font-semibold text-white m-0">
                  Selected stalls
                </p>
                {formData.selectedRooms.length === 0 ? (
                  <p className="font-['Montserrat'] text-[12px] text-white/70 m-0">
                    No stalls selected yet.
                  </p>
                ) : (
                  <ul className="m-0 pl-5 list-disc text-white/90 font-['Montserrat'] text-[12px] flex flex-col gap-1">
                    {formData.selectedRooms.map((r) => {
                      const price = getStallPrice(r.sqft);
                      return (
                        <li key={r.id}>
                          {r.id} — {r.sqft} sq ft ({r.floor}) —{" "}
                          {price == null ? "Price on request" : formatINR(price)}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="font-['Montserrat'] text-[12px] font-semibold text-brand-accent-cyan m-0 mt-1">
                  Total:{" "}
                  {formData.selectedRooms.reduce(
                    (s, r) => s + (Number(r.sqft) || 0),
                    0
                  )}{" "}
                  sq ft ·{" "}
                  {formatINR(
                    formData.selectedRooms.reduce(
                      (s, r) => s + (getStallPrice(r.sqft) || 0),
                      0
                    )
                  )}
                </p>
              </div>

              {errors.selectedRooms && (
                <span className="text-[11px] font-semibold text-red-600 font-['Montserrat']">
                  {errors.selectedRooms}
                </span>
              )}
            </div>
          </SectionCard>

          {/* Back / Continue to Payment */}
          <div className="flex justify-between items-center mt-2 mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-10 py-3 rounded-[40px] font-['Baloo'] text-[18px] md:text-[20px] font-bold bg-gradient-to-r from-brand-primary to-brand-accent-cyan text-[#0A1830] hover:opacity-90 cursor-pointer shadow-[0_8px_30px_rgba(56,189,248,0.45)] transition-all"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.agreedToRules}
              className={`px-10 py-3 rounded-[40px] font-['Baloo'] text-[18px] md:text-[20px] font-bold transition-all ${
                isSubmitting || !formData.agreedToRules
                  ? "bg-[#23282e] text-[#777] cursor-not-allowed"
                  : "bg-gradient-to-r from-brand-primary to-brand-accent-cyan text-[#0A1830] hover:opacity-90 cursor-pointer shadow-[0_8px_30px_rgba(56,189,248,0.45)]"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Continue to Payment →"}
            </button>
          </div>
        </>)}
        </main>

        {/* Footer */}
        <footer className="text-center mt-4 pb-6">
          <p className="font-['Montserrat'] text-[11px] md:text-[13px] text-white/80 m-0">
            © 2026{" "}
            <a
              href="https://www.sportskeyz.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-primary transition-colors"
            >
              SportsKeyz
            </a>
            . Powered by SporTech Innovation. All rights reserved.
          </p>
        </footer>
        </div>
      </div>

      {/* Fixed SportsKeyz logo (bottom-left) */}
      <a
        href="https://www.sportskeyz.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-[28px] md:bottom-10 md:left-[52px] z-20 w-[85px] md:w-[135px] hover:opacity-80 transition-opacity"
      >
        <img
          src="./assets/sportskeyz.png"
          alt="SportsKeyz"
          className="w-full h-auto"
        />
      </a>

      {/* Rules modal */}
      <RulesModal
        open={rulesModalOpen}
        onAccept={() => {
          setField("agreedToRules", true);
          setRulesModalOpen(false);
        }}
        onDecline={() => setRulesModalOpen(false)}
      />

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[700] p-4">
          <div className="bg-[#0A1830] rounded-[20px] p-8 max-w-[500px] w-full flex flex-col items-center gap-4 shadow-2xl border border-brand-primary/30">
            <div className="w-[80px] h-[80px] rounded-full border-[3px] border-brand-primary flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-['Montserrat'] text-[24px] font-bold text-white text-center m-0">
              Registration Submitted!
            </h2>
            <p className="font-['Montserrat'] text-[14px] text-[#cfd6e4] text-center m-0">
              Thank you for registering as an exhibitor for LevelUp Northeast 2026.
            </p>
            <div className="w-full py-3 px-4 border border-brand-primary rounded-[14px] text-center">
              <span className="font-['Montserrat'] text-[14px] font-semibold text-brand-primary break-words">
                Exhibitor ID: {registrationId}
              </span>
            </div>
            <p className="font-['Montserrat'] text-[12px] text-[#8a8a8a] text-center m-0">
              A confirmation email has been sent to your communication email.
            </p>
            <button
              onClick={() => {
                window.location.href = "https://levelupnortheast.in/";
              }}
              className="mt-2 px-8 py-2.5 rounded-[30px] bg-gradient-to-r from-brand-primary to-brand-accent-cyan font-['Montserrat'] text-[14px] font-semibold text-[#0A1830] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
