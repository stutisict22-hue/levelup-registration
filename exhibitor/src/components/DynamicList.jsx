import React from "react";
import FormInput from "./FormInput";

// Generic add/remove list of rows. Each row is rendered by `renderRow(item, index, update)`.
// When the row is a single string field, pass `simple: true` to get a built-in
// FormInput row.
export default function DynamicList({
  label,
  helper,
  items,
  setItems,
  newItem,
  maxItems = 20,
  addLabel = "+ Add another",
  renderRow,
  simple = false,
  inputPlaceholder = "",
}) {
  const updateItem = (idx, value) => {
    const next = [...items];
    next[idx] = value;
    setItems(next);
  };

  const addItem = () => {
    if (items.length >= maxItems) return;
    const blank =
      typeof newItem === "function" ? newItem() : structuredClone(newItem);
    setItems([...items, blank]);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <div>
          <p className="font-['Montserrat'] text-[12px] font-semibold text-[rgb(10,24,48)] m-0">
            {label}
          </p>
          {helper && (
            <p className="font-['Montserrat'] text-[10px] text-[#3a4055] m-0 mt-0.5">
              {helper}
            </p>
          )}
        </div>
      )}

      {items.map((item, idx) => (
        <div key={idx} className="w-full">
          {simple ? (
            <FormInput
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={inputPlaceholder}
              labelColor="text-[rgb(10,24,48)]"
            />
          ) : (
            renderRow(item, idx, (value) => updateItem(idx, value))
          )}
        </div>
      ))}

      {items.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          className="self-start mt-1 px-4 py-1.5 rounded-full bg-[#0A1830] text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-[#0A1830] transition-colors font-['Montserrat'] text-[11px] font-semibold cursor-pointer"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
