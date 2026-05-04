import React from "react";

export default function SectionCard({ title, children, className = "" }) {
  return (
    <section
      className={`bg-[#9e9e9e] rounded-[40px] md:rounded-[56px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${className}`}
    >
      {title && (
        <header className="bg-[#0A1830] px-6 py-3">
          <h2 className="font-['Montserrat'] text-[14px] md:text-[16px] font-bold text-white tracking-[1px] text-center uppercase">
            {title}
          </h2>
        </header>
      )}
      <div className="p-5 md:p-7">{children}</div>
    </section>
  );
}
