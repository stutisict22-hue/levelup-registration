import React from "react";

export default function FormInput({ label, value, onChange, placeholder, type = "text", error, required }) {
  return (
    <div className="flex flex-col gap-[5px] items-start w-full flex-nowrap relative">
      <span className="flex w-[155.143px] h-[13px] justify-start items-start shrink-0 basis-auto font-['Montserrat'] text-[11.081676483154297px] font-normal leading-[13px] text-[#fff] relative text-left whitespace-nowrap">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="flex w-full h-[33.218px] pt-[7.388px] pr-[18.469px] pb-[7.388px] pl-[18.469px] gap-[9.235px] items-center shrink-0 flex-nowrap bg-[#23282e] rounded-[55.408px] relative overflow-hidden">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-[13px] grow shrink-0 basis-auto font-['Montserrat'] text-[11.081676483154297px] font-normal leading-[13px] text-[#fff] bg-transparent border-none outline-none placeholder:opacity-30 placeholder:text-[#fff]"
        />
      </div>
      {error && (
        <span className="text-[10px] text-red-400 font-['Montserrat'] absolute top-full left-0 mt-[2px] z-20">
          {error}
        </span>
      )}
    </div>
  );
}
