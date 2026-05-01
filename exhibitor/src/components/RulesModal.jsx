import React, { useEffect } from "react";
import { exhibitorRules } from "../services/exhibitorRules";

// Render rule body with simple inline markup:
//   - **text**  → bold
//   - "## " line → sub-heading (bold + underline + spacing)
//   - blank line → vertical gap
const renderInline = (line) => {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const renderRichText = (text) =>
  text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h4
          key={i}
          className="font-['Montserrat'] text-[13px] font-semibold text-white border-b border-white/30 pb-1 mt-4 mb-2"
        >
          {line.slice(3)}
        </h4>
      );
    }
    if (line === "") {
      return <div key={i} aria-hidden className="h-[6px]" />;
    }
    return (
      <p key={i} className="m-0">
        {renderInline(line)}
      </p>
    );
  });

export default function RulesModal({ open, onAccept, onDecline }) {
  useEffect(() => {
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[600] p-4">
      <div className="bg-[#0A1830] rounded-[20px] w-full max-w-[820px] max-h-[90vh] flex flex-col shadow-2xl border border-brand-primary/30 overflow-hidden">
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <h2 className="font-['Montserrat'] text-[18px] md:text-[22px] font-bold text-white">
            General Exhibitor Rules
          </h2>
          <span className="font-['Montserrat'] text-[11px] text-[#8a8a8a] hidden md:block">
            LevelUp Northeast 2026
          </span>
        </header>

        <div className="overflow-y-auto px-6 py-5 grow">
          <p className="font-['Montserrat'] text-[12px] text-[#cfd6e4] leading-[20px] mb-4">
            Please read the following rules carefully.
          </p>
          <ol className="flex flex-col gap-4 list-none p-0 m-0">
            {(() => {
              let counter = 0;
              return exhibitorRules.map((rule, idx) => {
                let label;
                if (rule.subRule) {
                  // e.g. counter=9, subRule="a" -> "9 a)"
                  label = `${counter} ${rule.subRule})`;
                } else {
                  // explicit `number` overrides — re-seeds the counter so
                  // subsequent rules continue from there.
                  counter = rule.number != null ? rule.number : counter + 1;
                  label = `${counter}.`;
                }
                return (
                  <li key={idx} className="text-white">
                    <h3 className="font-['Montserrat'] text-[13px] md:text-[14px] font-semibold text-brand-primary mb-1">
                      {label} {rule.title}
                    </h3>
                    <div className="font-['Montserrat'] text-[12px] leading-[18px] text-[#dfe5f1]">
                      {renderRichText(rule.body)}
                    </div>
                  </li>
                );
              });
            })()}
          </ol>
        </div>

        <footer className="px-6 py-4 border-t border-white/10 flex flex-col-reverse md:flex-row gap-3 md:justify-end shrink-0">
          <button
            type="button"
            onClick={onDecline}
            className="px-6 py-2.5 rounded-[30px] bg-transparent border border-white/30 font-['Montserrat'] text-[14px] font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="px-6 py-2.5 rounded-[30px] bg-gradient-to-r from-brand-primary to-brand-accent-cyan font-['Montserrat'] text-[14px] font-semibold text-[#0A1830] hover:opacity-90 transition-opacity cursor-pointer"
          >
            I Accept
          </button>
        </footer>
      </div>
    </div>
  );
}
