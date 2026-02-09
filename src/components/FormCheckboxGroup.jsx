import React from "react";

export default function FormCheckboxGroup({ label, values, onChange, options, error }) {
  const handleToggle = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="flex flex-col gap-[9.235px] items-start w-full flex-nowrap relative">
      <span className="flex w-[200px] h-[13px] justify-start items-start shrink-0 basis-auto font-['Montserrat'] text-[11.081676483154297px] font-normal leading-[13px] text-[#fff] relative text-left whitespace-nowrap">
        {label}
      </span>
      <div className="flex flex-wrap gap-[12px] items-center w-full">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex gap-[8px] items-center cursor-pointer"
            onClick={() => handleToggle(option)}
          >
            <div
              className={`w-[18px] h-[18px] rounded-[5px] border border-[#30dfa0] flex items-center justify-center transition-colors ${
                values.includes(option) ? "bg-[#30dfa0]" : "bg-transparent"
              }`}
            >
              {values.includes(option) && (
                <svg
                  width="12"
                  height="12"
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
            <span className="font-['Montserrat'] text-[11px] text-[#fff]">
              {option}
            </span>
          </div>
        ))}
      </div>
      {error && (
        <span className="text-[10px] text-red-400 font-['Montserrat']">
          {error}
        </span>
      )}
    </div>
  );
}
