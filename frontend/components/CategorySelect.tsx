"use client";

import { useEffect, useRef, useState } from "react";

const categories = [
  {
    value: "",
    label: "All categories",
    description: "Search everything",
  },
  {
    value: "textiles",
    label: "Textiles",
    description: "Clothes, bags, shoes",
  },
  {
    value: "electronics",
    label: "Electronics",
    description: "Phones, kitchen appliances, lamps",
  },
];

type CategorySelectProps = {
  category: string;
  onCategoryChange: (value: string) => void;
};

export default function CategorySelect({
  category,
  onCategoryChange,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={categoryRef} className="relative z-50 w-full shrink-0 sm:w-36">
      <button
        type="button"
        aria-label="Select category"
        aria-expanded={isOpen}
        aria-controls="category-options"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-3 text-xs font-semibold text-brand-navy"
      >
        <span>
          {categories.find((item) => item.value === category)?.label ??
            "All categories"}
        </span>

        <span aria-hidden="true">⌄</span>
      </button>

      {isOpen && (
        <div
          id="category-options"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                onCategoryChange(item.value);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-brand-light"
            >
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-brand-navy">
                  {item.label}
                </span>
                <span className="text-xs text-gray-500">
                  {item.description}
                </span>
              </span>

              {category === item.value && (
                <span className="ml-2 text-brand-blue" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
