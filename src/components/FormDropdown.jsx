import React, { useState, useRef, useEffect } from "react";

export default function FormDropdown({ label, value, onChange, placeholder, options, error, multiSelect = false, required }) {
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

  const handleSelect = (option) => {
    if (multiSelect) {
      const currentValues = value || [];
      if (currentValues.includes(option)) {
        onChange(currentValues.filter((v) => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiSelect) {
      if (!value || value.length === 0) return placeholder;
      return value.join(", ");
    }
    return value || placeholder;
  };

  const isSelected = (option) => {
    if (multiSelect) {
      return (value || []).includes(option);
    }
    return value === option;
  };

  return (
    <div className="flex flex-col gap-[5px] items-start w-full flex-nowrap relative" ref={dropdownRef}>
      <span className="flex w-[155.143px] h-[13px] justify-start items-start shrink-0 basis-auto font-['Montserrat'] text-[11.081676483154297px] font-normal leading-[13px] text-[#fff] relative text-left whitespace-nowrap">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div
        className={`flex w-full h-[33.218px] pt-[7.388px] pr-[18.469px] pb-[7.388px] pl-[18.469px] gap-[9.235px] items-center shrink-0 flex-nowrap bg-[#23282e] ${isOpen ? "rounded-t-[16px] rounded-b-none" : "rounded-[55.408px]"} relative overflow-visible cursor-pointer transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`h-[13px] grow shrink-0 basis-auto font-['Montserrat'] text-[11.081676483154297px] font-normal leading-[13px] text-[#fff] relative text-left whitespace-nowrap overflow-hidden text-ellipsis ${!value || (multiSelect && value.length === 0) ? "opacity-30" : ""}`}>
          {getDisplayValue()}
        </span>
        <div
          className={`w-[9.235px] h-[5.732px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-02-05/131GQbrVix.png)] bg-cover bg-no-repeat relative transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-[42px] left-0 w-full bg-[#23282e] rounded-b-[16px] z-[200] max-h-[200px] overflow-y-auto overflow-x-hidden shadow-lg" style={{ backgroundColor: '#23282e' }}>
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center gap-[10px] px-[18.469px] py-[10px] hover:bg-[#30dfa0] hover:text-[#23282e] cursor-pointer font-['Montserrat'] text-[11.081676483154297px] text-[#fff] transition-colors bg-[#23282e] ${index === options.length - 1 ? "rounded-b-[16px]" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {multiSelect && (
                <div
                  className={`w-[14px] h-[14px] rounded-[3px] border border-[#30dfa0] flex items-center justify-center shrink-0 ${isSelected(option) ? "bg-[#30dfa0]" : "bg-transparent"
                    }`}
                >
                  {isSelected(option) && (
                    <svg
                      width="10"
                      height="10"
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
              )}
              {option}
            </div>
          ))}
        </div>
      )}

      {error && (
        <span className="text-[10px] text-red-400 font-['Montserrat'] absolute top-full left-0 mt-[2px] z-20">
          {error}
        </span>
      )}
    </div>
  );
}
