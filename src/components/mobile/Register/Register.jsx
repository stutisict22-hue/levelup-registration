import Header from "../Header/Header";
import AvatarUpload from "../AvatarUpload/AvatarUpload";
import FormField from "../FormField/FormField";
import "./Register.css";

export default function MobileRegister({
    formData,
    handleInputChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleImageUpload,
    handleSubmit,
    handleTermsChange,
    dropdownOptions,
    errors,
    isSubmitting,
    profileImage,
    showSuccessModal,
    registrationId,
    onCloseSuccess
}) {
    return (
        <div className="register-page">
            <div className="scroll-container">
                <Header />

                <div className="content-padding">
                    <AvatarUpload
                        onImageSelect={(file) => handleImageUpload({ target: { files: [file] } })}
                        previewUrl={profileImage}
                    />
                    {errors.profileImage && <div className="text-red-500 text-xs text-center mt-1">{errors.profileImage}</div>}

                    <div className="form">
                        <FormField
                            label="First Name"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange("firstName")}
                            error={errors.firstName}
                        />
                        <FormField
                            label="Middle Name"
                            value={formData.middleName}
                            onChange={handleInputChange("middleName")}
                        />
                        <FormField
                            label="Last Name"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange("lastName")}
                            error={errors.lastName}
                        />
                        <FormField
                            label="Designation"
                            required /* Marked required in image */
                            value={formData.designation}
                            onChange={handleInputChange("designation")}
                        />
                        <FormField
                            label="Organization Name"
                            required
                            value={formData.organization || ""}
                            onChange={handleInputChange("organization")}
                            error={errors.organization}
                        />
                        <FormField
                            label="Type of Organization"
                            required
                            type="select"
                            value={formData.organizationType}
                            onChange={(e) => handleDropdownChange("organizationType")(e.target.value)}
                            options={dropdownOptions.organizationTypes}
                            error={errors.organizationType}
                        />
                        <FormField
                            label="Email Address"
                            required
                            value={formData.emailAddress}
                            onChange={handleInputChange("emailAddress")}
                            error={errors.emailAddress}
                            type="email"
                        />
                        <FormField
                            label="City"
                            required
                            value={formData.city}
                            onChange={handleInputChange("city")}
                        />
                        <FormField
                            label="Phone No"
                            required
                            value={formData.phoneNo}
                            onChange={handleInputChange("phoneNo")}
                            error={errors.phoneNo}
                            type="tel"
                        />
                        <FormField
                            label="Attending Program"
                            required
                            value={formData.attendingProgram}
                            onChange={handleInputChange("attendingProgram")}
                        />
                        <FormField
                            label="Category"
                            required
                            type="select"
                            value={formData.category}
                            onChange={(e) => handleDropdownChange("category")(e.target.value)}
                            options={dropdownOptions.categories}
                            error={errors.category}
                        />
                        <FormField
                            label="Membership Affiliation"
                            required
                            type="multiselect"
                            value={formData.membershipAffiliation}
                            onChange={(newValues) => handleCheckboxChange('membershipAffiliation')(newValues)}
                            options={dropdownOptions.membershipAffiliations}
                            error={errors.membershipAffiliation}
                        />
                        <FormField
                            label="Preferred Day(s) to Attend"
                            required
                            type="multiselect"
                            value={formData.preferredDays}
                            onChange={(newValues) => handleCheckboxChange('preferredDays')(newValues)}
                            options={dropdownOptions.preferredDays}
                            error={errors.preferredDays}
                        />

                        <div className="terms-text">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <div className={`w-5 h-5 rounded border border-[#30dfa0] flex items-center justify-center shrink-0 mt-1 ${formData.agreedToTerms ? 'bg-[#30dfa0]' : 'transparent'}`}>
                                    {formData.agreedToTerms && <span className="text-black text-xs font-bold">✓</span>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.agreedToTerms}
                                    onChange={handleTermsChange}
                                    className="hidden"
                                />
                                <p className="text-[10px] text-[#8a8a8a] leading-[1.4] font-['Montserrat']">
                                    In consideration of being permitted to participate in, attend, or engage with LevelUp Northeast (the "Event"), organized by the Indian Digital Gaming Society (IDGS) and the Confederation of Indian Industry (CII), I (the "Participant"), on behalf of myself, my heirs, executors, administrators, and assigns, hereby agree to indemnify, defend, and hold harmless IDGS, CII, their officers, directors, employees, volunteers, agents, sponsors, venue owners, and affiliates (collectively, the "Released Parties") from and against any and all claims, demands, actions, losses, liabilities, damages, costs, and expenses (including reasonable legal fees) arising out of or in connection with my participation in, attendance at, or involvement with the Event, including but not limited to any injury, illness, death, property damage, or other loss, whether caused in whole or in part by the negligence of any Released Party (except to the extent caused by gross negligence or willful misconduct, where prohibited by applicable law). I acknowledge and resume all risks associated with the Event, including those related to gaming, esports activities, hardware use, crowds, or venue conditions. This indemnity survives the Event's completion and is governed by the laws of India.
                                </p>
                            </label>
                        </div>
                    </div>
                    {errors.agreedToTerms && <span className="error-text" style={{ marginLeft: '26px' }}>{errors.agreedToTerms}</span>}

                    <div className="submit-container">
                        <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "..." : "Submit"}
                        </button>
                    </div>

                    <div style={{ height: '40px' }}></div>
                </div>
            </div>

            <div className="copyright-footer">
                © 2026 SportsKeyz. Powered by SporTech Innovation. All rights reserved.
            </div>

            {/* Fixed Logos */}

            {/* Fixed Logos */}
            <a href="https://sportskeyz.com/" target="_blank" rel="noopener noreferrer" className="fixed-logo-bottom-left">
                <img
                    src="/assets/sportskeyz.png"
                    alt="SportsKeyz"
                    className="w-full h-auto"
                />
            </a>

            {/* Success Modal - Mobile Version */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] p-4">
                    <div className="bg-[#1d1e20] rounded-[20px] p-6 w-full max-w-sm flex flex-col items-center gap-5 shadow-2xl border border-[#333]">
                        {/* Checkmark Icon */}
                        <div className="w-[80px] h-[80px] rounded-full border-[3px] border-[#30dfa0] flex items-center justify-center shrink-0">
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
                        <h2 className="font-['Montserrat'] text-[24px] font-bold text-white text-center">
                            Registration Successful!
                        </h2>

                        {/* Description */}
                        <p className="font-['Montserrat'] text-[14px] text-[#8a8a8a] text-center">
                            Thank you for registering for LevelUP NorthEast 2026.
                        </p>

                        {/* Registration ID Box */}
                        <div className="w-full py-3 px-4 border border-[#30dfa0] rounded-[15px] text-center bg-[#30dfa0]/10">
                            <span className="font-['Montserrat'] text-[14px] font-semibold text-[#30dfa0] break-words">
                                ID: {registrationId}
                            </span>
                        </div>

                        {/* Email Confirmation Text */}
                        <p className="font-['Montserrat'] text-[12px] text-[#8a8a8a] text-center">
                            A confirmation email has been sent to your email address.
                        </p>

                        {/* Close Button */}
                        <button
                            onClick={onCloseSuccess}
                            className="mt-2 w-full py-3 bg-gradient-to-r from-[#30dfa0] to-[#20b080] rounded-[30px] font-['Montserrat'] text-[16px] font-semibold text-[#1d1e20] hover:opacity-90 transition-opacity active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
