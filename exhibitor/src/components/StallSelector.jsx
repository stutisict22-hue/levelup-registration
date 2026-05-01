import React from "react";

export default function StallSelector({ options, value, onChange, error, required }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-baseline gap-1">
        <label className="font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
          Stall Size
        </label>
        {required && <span className="text-red-600 text-[14px] leading-[16px]">*</span>}
        <span className="ml-auto font-['Montserrat'] text-[10px] text-[#3a4055] italic">
          Charges include fascia branding, flex walls, carpet, 1 table, 2 chairs, 1 plug point, wastebasket and general lighting (2 days). Plus applicable taxes.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border transition-all text-left cursor-pointer ${
                selected
                  ? "bg-brand-primary border-brand-primary text-[#0A1830] shadow-[0_4px_18px_rgba(56,189,248,0.45)]"
                  : "bg-[#23282e] border-transparent text-white hover:border-brand-primary/60"
              }`}
            >
              <span className="flex flex-col">
                <span className="font-['Montserrat'] text-[12px] font-semibold leading-tight">
                  {opt.label}
                </span>
                {opt.subLabel && (
                  <span className="font-['Montserrat'] text-[10px] opacity-70 mt-0.5">
                    {opt.subLabel}
                  </span>
                )}
              </span>
              <span className={`font-['Montserrat'] text-[13px] font-bold whitespace-nowrap ${selected ? "text-[#0A1830]" : "text-brand-accent-cyan"}`}>
                {opt.price}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <span className="text-[11px] text-red-500 font-['Montserrat']">{error}</span>
      )}
    </div>
  );
}
