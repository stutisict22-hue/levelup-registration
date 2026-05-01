import React from "react";

export default function CatalogueAdGroup({ options, value, onChange }) {
  const toggle = (id) => {
    const current = value || [];
    if (current.includes(id)) {
      onChange(current.filter((v) => v !== id));
    } else {
      onChange([...current, id]);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-baseline gap-2">
        <label className="font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
          Catalogue Advertisement
        </label>
        <span className="font-['Montserrat'] text-[10px] text-[#3a4055] italic">
          Optional. Select all that apply.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = (value || []).includes(opt.id);
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-[12px] border transition-all text-left cursor-pointer ${
                selected
                  ? "bg-brand-primary border-brand-primary text-[#0A1830]"
                  : "bg-[#23282e] border-transparent text-white hover:border-brand-primary/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${
                    selected
                      ? "bg-[#0A1830] border-[#0A1830]"
                      : "border-brand-primary bg-transparent"
                  }`}
                >
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M13 4L6 11L3 8" stroke="#30dfa0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="font-['Montserrat'] text-[12px] font-semibold leading-tight">
                  {opt.label}
                </span>
              </span>
              <span
                className={`font-['Montserrat'] text-[11px] font-bold whitespace-nowrap ${
                  selected ? "text-[#0A1830]" : "text-brand-accent-cyan"
                }`}
              >
                {opt.price}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
