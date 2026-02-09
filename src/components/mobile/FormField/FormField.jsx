import { useState, useRef, useEffect } from "react";
import "./FormField.css";

export default function FormField({
    label,
    required,
    type = "text",
    value,
    onChange,
    options = [],
    error,
    multiple = false
}) {
    // Simple state for dropdown visibility
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMultiSelect = (option) => {
        const currentValues = Array.isArray(value) ? value : [];
        let newValues;
        if (currentValues.includes(option)) {
            newValues = currentValues.filter((v) => v !== option);
        } else {
            newValues = [...currentValues, option];
        }
        // Emulate event object for parent handler if needed, or just pass value
        // The parent handleCheckboxChange expects just the value array
        // But FormField props might expect an event. Let's adjust based on usage.
        // Register.jsx passes: (e) => handleDropdownChange/handleCheckboxChange(val)
        // Actually Register.jsx usage:
        // onChange={(e) => { const vals = ...; handleCheckboxChange(...)(vals) }}
        // We should probably just call onChange with the new array directly if it's multiselect
        // BUT to keep api consistent, let's pass a synthetic event or just the value if the parent handles it.
        // Looking at Register.jsx again, it manually extracts options from e.target.selectedOptions.
        // We need to update Register.jsx to handle this new onChange format too.

        // Let's standardise: for multiselect, onChange receives the NEW ARRAY directly.
        onChange(newValues);
    };

    const isSelected = (option) => Array.isArray(value) && value.includes(option);

    return (
        <div className="field" ref={dropdownRef}>
            <label>
                {label} {required && <span className="required-star">*</span>}
            </label>

            {type === "multiselect" ? (
                <div className="select-wrapper">
                    <div
                        className={`input-element flex-center ${error ? "error-border" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className={`value-text ${!value?.length ? 'placeholder' : ''}`}>
                            {value?.length ? value.join(", ") : `Select ${label}`}
                        </span>
                        <div className={`select-arrow ${isOpen ? 'rotate' : ''}`}>▼</div>
                    </div>

                    {isOpen && (
                        <div className="dropdown-options">
                            {options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className="dropdown-item"
                                    onClick={() => handleMultiSelect(opt)}
                                >
                                    <div className={`checkbox ${isSelected(opt) ? 'checked' : ''}`}>
                                        {isSelected(opt) && "✓"}
                                    </div>
                                    <span>{opt}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : type === "select" ? (
                <div className="select-wrapper">
                    <select
                        value={value}
                        onChange={onChange}
                        multiple={multiple}
                        className={`input-element ${error ? "error-border" : ""}`}
                        style={{ height: '48px' }} // Ensure height match
                    >
                        {!multiple && <option value="">Select {label}</option>}
                        {options.map((opt, idx) => (
                            <option key={idx} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                    {!multiple && <div className="select-arrow" style={{ pointerEvents: 'none' }}>▼</div>}
                </div>
            ) : (
                <input
                    type={type}
                    placeholder={label}
                    value={value}
                    onChange={onChange}
                    className={`input-element ${error ? "error-border" : ""}`}
                />
            )}
            {error && <span className="error-text">{error}</span>}
        </div>
    );
}
