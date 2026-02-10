import React, { useState, useRef } from "react";
import "./index.css";
import FormInput from "../components/FormInput";
import FormDropdown from "../components/FormDropdown";
import { formService, dropdownOptions } from "../services/formService";
import MobileRegister from "../components/mobile/Register/Register";
import "../styles/globals.css";



export default function Main() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    designation: "",
    organization: "", // Added for mobile
    organizationType: "",
    emailAddress: "",
    city: "",
    phoneNo: "",
    attendingProgram: "",
    category: "",
    membershipAffiliation: [],
    preferredDays: [],
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const fileInputRef = useRef(null);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitStatus({ type: "error", message: "Image size should be less than 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setSubmitStatus(null);
        if (errors.profileImage) {
          setErrors((prev) => ({ ...prev, profileImage: "" }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
    setSubmitStatus(null);
  };

  const handleDropdownChange = (field) => (value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
    setSubmitStatus(null);
  };

  const handleCheckboxChange = (field) => (values) => {
    setFormData({
      ...formData,
      [field]: values,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
    setSubmitStatus(null);
  };
  const handleTermsChange = (e) => {
    setFormData({
      ...formData,
      agreedToTerms: e.target.checked,
    });
    if (errors.agreedToTerms) {
      setErrors({
        ...errors,
        agreedToTerms: "",
      });
    }
  };



  const validateForm = () => {
    const newErrors = {};

    if (!profileImage) {
      newErrors.profileImage = "Profile photo is required";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = "Email is required";
    } else if (!formService.validateEmail(formData.emailAddress)) {
      newErrors.emailAddress = "Invalid email format";
    }

    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = "Phone number is required";
    } else if (!formService.validatePhone(formData.phoneNo)) {
      newErrors.phoneNo = "Invalid phone number";
    }

    // Organization Name validation
    if (!formData.organization || !formData.organization.trim()) {
      newErrors.organization = "Organization Name is required";
    }

    if (!formData.organizationType) {
      newErrors.organizationType = "Organization type is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.membershipAffiliation.length) {
      newErrors.membershipAffiliation = "Membership affiliation is required";
    }

    if (!formData.preferredDays.length) {
      newErrors.preferredDays = "Preferred days is required";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await formService.submitRegistration(formData);
      setRegistrationId(response.id);
      setShowSuccessModal(true);
      setSubmitStatus(null);
      // Reset form after successful submission
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        designation: "",
        organization: "",
        organizationType: "",
        emailAddress: "",
        city: "",
        phoneNo: "",
        attendingProgram: "",
        category: "",
        membershipAffiliation: [],
        preferredDays: [],
        agreedToTerms: false,
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit registration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="hidden md:block main-container w-[1440px] h-[1033px] bg-[#19191a] relative overflow-hidden mx-auto my-0">
        <div className="w-[1366.667px] h-[931.042px] relative z-[85] mt-[51px] mr-0 mb-0 ml-[35px]">
          <div className="w-[1366.667px] h-[931.042px] bg-[#000] opacity-70 absolute top-0 left-0 overflow-hidden z-[2]" />
          <a href="https://www.cii.in/" target="_blank" rel="noopener noreferrer" className="w-[248px] h-[132px] bg-[url('/CII%20Logo.png')] bg-contain bg-center bg-no-repeat absolute top-[5px] left-[23px] z-[4] cursor-pointer hover:opacity-80 transition-opacity" />
          <a href="https://gamingsociety.in/" target="_blank" rel="noopener noreferrer" className="w-[111px] h-[55.192px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/GOVpfe0jQC.png)] bg-cover bg-no-repeat absolute top-[21px] left-[1230px] z-[3] cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="w-[355.494px] h-[123px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/KUwDGqOFOj.png)] bg-cover bg-no-repeat absolute top-[24px] left-[505px] z-[85]" />

          {/* Left Form Section */}
          <div className="w-[556.158px] h-[703.264px] bg-[#1d1e20] rounded-[142.361px] absolute top-[160px] left-[100px] overflow-visible z-[9]">

            <div className="flex w-[379.63px] h-auto max-h-[750px] flex-col gap-[15px] items-start flex-nowrap absolute top-[36px] left-[83.519px] z-10 overflow-visible">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                placeholder="First Name"
                error={errors.firstName}
                required
              />
              <FormInput
                label="Middle Name"
                value={formData.middleName}
                onChange={handleInputChange("middleName")}
                placeholder="Middle Name"
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                placeholder="Last Name"
                error={errors.lastName}
                required
              />
              <FormInput
                label="Designation"
                value={formData.designation}
                onChange={handleInputChange("designation")}
                placeholder="Designation"
                required
              />
              <FormInput
                label="Organization Name"
                value={formData.organization}
                onChange={handleInputChange("organization")}
                placeholder="Organization Name"
                error={errors.organization}
                required
              />
              <FormDropdown
                label="Type of Organization"
                value={formData.organizationType}
                onChange={handleDropdownChange("organizationType")}
                placeholder="Organization type"
                options={dropdownOptions.organizationTypes}
                error={errors.organizationType}
                required
              />
              <FormInput
                label="Email Address"
                value={formData.emailAddress}
                onChange={handleInputChange("emailAddress")}
                placeholder="Email Address"
                type="email"
                error={errors.emailAddress}
                required
              />
              <FormInput
                label="City"
                value={formData.city}
                onChange={handleInputChange("city")}
                placeholder="City"
                required
              />
              <FormInput
                label="Phone No"
                value={formData.phoneNo}
                onChange={handleInputChange("phoneNo")}
                placeholder="Phone No"
                type="tel"
                error={errors.phoneNo}
                required
              />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div
            className="w-[129.223px] h-[129.223px] rounded-full absolute top-[160px] left-[919.051px] z-[53] cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/xH75HzMykW.png)] bg-cover bg-no-repeat ${errors.profileImage ? "border-2 border-red-500 rounded-full" : ""}`} />
            )}
          </div>
          {errors.profileImage && (
            <span className="absolute top-[220px] left-[1060px] text-[12px] text-red-500 font-['Montserrat'] z-[54] w-[200px]">
              {errors.profileImage}
            </span>
          )}

          {/* Right Form Section */}
          <div className="w-[556px] h-[601px] bg-[#1d1e20] rounded-[142.361px] absolute top-[250px] left-[713px] overflow-visible z-[52]">
            <div className="w-[379.63px] h-auto relative z-[78] mt-[38px] mr-0 mb-0 ml-[88px]">
              {/* Spacer to reserve vertical space for the absolutely-positioned form fields */}
              <div className="h-[246px]" />
              <div className="flex w-[379.63px] h-auto flex-col gap-[18.032px] items-start flex-nowrap absolute top-0 left-0 z-[150] overflow-visible">
                <FormDropdown
                  label="Attending Program For"
                  value={formData.attendingProgram}
                  onChange={(val) => setFormData({ ...formData, attendingProgram: val })}
                  placeholder="Attending Program"
                  options={dropdownOptions.attendingPrograms}
                  error={errors.attendingProgram}
                  required
                  multiSelect={true}
                />
                <FormDropdown
                  label="Category"
                  value={formData.category}
                  onChange={handleDropdownChange("category")}
                  placeholder="Category"
                  options={dropdownOptions.categories}
                  error={errors.category}
                  required
                />
                <FormDropdown
                  label="Membership Affiliation"
                  value={formData.membershipAffiliation}
                  onChange={handleCheckboxChange("membershipAffiliation")}
                  placeholder="Membership Affiliation"
                  options={dropdownOptions.membershipAffiliations}
                  error={errors.membershipAffiliation}
                  required
                  multiSelect={true}
                />
                <FormDropdown
                  label="Preferred Day(s) to Attend"
                  value={formData.preferredDays}
                  onChange={handleCheckboxChange("preferredDays")}
                  placeholder="Preferred Day(s) to Attend"
                  options={dropdownOptions.preferredDays}
                  error={errors.preferredDays}
                  required
                  multiSelect={true}
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex gap-[10px] items-start relative z-[50] mt-[65px] ml-[55px] w-[410px]">
              <div
                className={`w-[20px] min-w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border ${formData.agreedToTerms ? "bg-[#30dfa0]" : ""
                  } border-[#30dfa0] cursor-pointer flex items-center justify-center`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    agreedToTerms: !formData.agreedToTerms,
                  });
                  if (errors.agreedToTerms) {
                    setErrors({
                      ...errors,
                      agreedToTerms: "",
                    });
                  }
                }}
              >
                {formData.agreedToTerms && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 4L6 11L3 8"
                      stroke="#23282e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <p className="font-['Montserrat'] text-[8px] font-normal leading-[12px] text-[#fff] tracking-[0.08px] m-0 text-justify">
                In consideration of being permitted to participate in, attend, or
                engage with LevelUp Northeast (the "Event"), organized by the
                Indian Digital Gaming Society (IDGS) and the Confederation of
                Indian Industry (CII), I (the "Participant"), on behalf of myself,
                my heirs, executors, administrators, and assigns, hereby agree to
                indemnify, defend, and hold harmless IDGS, CII, their officers,
                directors, employees, volunteers, agents, sponsors, venue owners,
                and affiliates (collectively, the "Released Parties") from and
                against any and all claims, demands, actions, losses, liabilities,
                damages, costs, and expenses (including reasonable legal fees)
                arising out of or in connection with my participation in,
                attendance at, or involvement with the Event, including but not
                limited to any injury, illness, death, property damage, or other
                loss, whether caused in whole or in part by the negligence of any
                Released Party (except to the extent caused by gross negligence or
                willful misconduct, where prohibited by applicable law). I
                acknowledge and assume all risks associated with the Event,
                including those related to gaming, esports activities, hardware
                use, crowds, or venue conditions. This indemnity survives the
                Event's completion and is governed by the laws of India.
              </p>
            </div>
            {errors.agreedToTerms && (
              <span className="text-[10px] text-red-400 font-['Montserrat'] ml-[55px] w-[410px] mt-[4px] block">
                {errors.agreedToTerms}
              </span>
            )}
          </div>

          <div className="w-[513.797px] h-[303px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/skuo3mA8Jn.png)] bg-cover bg-no-repeat opacity-50 absolute top-[345px] left-[426px] z-[7]" />

          {/* Submit Button */}
          <div
            className="w-[8.56%] h-[12.57%] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/Cqhg661JOt.png)] bg-[length:100%_100%] bg-no-repeat rounded-[50%] absolute top-[81.41%] left-[86.05%] z-[83] cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleSubmit}
          >
            <span
              className={`flex w-[104.289px] h-[31px] justify-center items-center font-['Baloo'] text-[25.644750595092773px] font-normal leading-[30.774px] text-[#23282e] absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap z-[84] ${isSubmitting ? "opacity-50" : ""
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </span>
          </div>

          {/* Status Message */}
          {submitStatus && (
            <div
              className={`absolute top-[750px] left-[50%] -translate-x-1/2 px-6 py-3 rounded-lg z-[90] ${submitStatus.type === "success"
                ? "bg-green-500"
                : "bg-red-500"
                }`}
            >
              <span className="font-['Montserrat'] text-[14px] text-white">
                {submitStatus.message}
              </span>
            </div>
          )}

          <a href="https://www.sportskeyz.com/" target="_blank" rel="noopener noreferrer" className="w-[111px] h-[65.46px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/ZDsnY5Qrg9.png)] bg-cover bg-no-repeat absolute top-[851.191px] left-[23px] z-[5] cursor-pointer hover:opacity-80 transition-opacity" />
        </div>
        <span className="flex w-[1212px] h-[20px] justify-center items-start font-['Montserrat'] text-[16px] font-medium leading-[19.504px] text-[#fff] relative text-center whitespace-nowrap z-[6] mt-[9.958px] mr-0 mb-0 ml-[112px]">
          © 2026 <a href="https://www.sportskeyz.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#30dfa0] transition-colors">SportsKeyz</a>. Powered by SporTech Innovation. All rights reserved.
        </span>
        <div className="w-[1442px] h-[1442px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/pMwY8Mpfqo.png)] bg-cover bg-no-repeat absolute top-[-4px] left-0" />

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[500]">
            <div className="bg-[#1d1e20] rounded-[20px] p-[40px] w-[500px] flex flex-col items-center gap-[20px] shadow-2xl">
              {/* Checkmark Icon */}
              <div className="w-[80px] h-[80px] rounded-full border-[3px] border-[#30dfa0] flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#30dfa0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="font-['Montserrat'] text-[28px] font-bold text-white">
                Registration Successful!
              </h2>

              {/* Description */}
              <p className="font-['Montserrat'] text-[16px] text-[#8a8a8a] text-center">
                Thank you for registering for LevelUP NorthEast 2026.
              </p>

              {/* Registration ID Box */}
              <div className="w-full py-[15px] px-[20px] border border-[#30dfa0] rounded-[30px] text-center">
                <span className="font-['Montserrat'] text-[16px] font-semibold text-[#30dfa0]">
                  Your Registration ID: {registrationId}
                </span>
              </div>

              {/* Email Confirmation Text */}
              <p className="font-['Montserrat'] text-[14px] text-[#8a8a8a] text-center">
                A confirmation email has been sent to your email address.
              </p>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setProfileImage(null);
                }}
                className="mt-[10px] px-[40px] py-[12px] bg-gradient-to-r from-[#30dfa0] to-[#20b080] rounded-[30px] font-['Montserrat'] text-[16px] font-semibold text-[#1d1e20] hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="block md:hidden">
        <MobileRegister
          formData={formData}
          handleInputChange={handleInputChange}
          handleDropdownChange={handleDropdownChange}
          handleCheckboxChange={handleCheckboxChange}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSubmit}
          handleTermsChange={handleTermsChange}
          dropdownOptions={dropdownOptions}
          errors={errors}
          isSubmitting={isSubmitting}
          profileImage={profileImage}
          showSuccessModal={showSuccessModal}
          registrationId={registrationId}
          onCloseSuccess={() => {
            setShowSuccessModal(false);
            setProfileImage(null);
          }}
        />
      </div>

    </>
  );
}
