import React from "react";

const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function WordCountTextarea({
  label,
  value,
  onChange,
  placeholder = "",
  maxWords = 200,
  required,
  error,
  rows = 6,
}) {
  const wordCount = countWords(value);
  const over = wordCount > maxWords;

  const handleChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
      onChange(text);
      return;
    }
    // Trim to max words; preserve trailing space so the user can keep typing
    // (they'll just type into a no-op until they delete a word).
    onChange(words.slice(0, maxWords).join(" "));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="flex items-center gap-1 font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)]">
        <span>{label}</span>
        {required && <span className="text-red-600 text-[14px] leading-[16px]">*</span>}
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y bg-[#23282e] rounded-[16px] px-4 py-3 font-['Montserrat'] text-[12px] leading-[18px] text-white placeholder:opacity-30 placeholder:text-white border-none outline-none"
      />
      <div className="flex justify-between items-center">
        {error ? (
          <span className="text-[11px] font-semibold text-red-600 font-['Montserrat']">{error}</span>
        ) : (
          <span />
        )}
        <span
          className={`font-['Montserrat'] text-[10px] ${
            over ? "text-red-500" : "text-[#3a4055]"
          }`}
        >
          {wordCount} / {maxWords} words
        </span>
      </div>
    </div>
  );
}
