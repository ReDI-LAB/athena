"use client";

import { useState } from "react";

import CategorySelect from "./CategorySelect";
import DistrictSelect from "./DistrictSelect";

// Values passed from the main page to the search form.
type RepairSearchFormProps = {
  category: string;
  searchText: string;
  district: string;
  parsing: boolean;
  parseError: string;
  loading: boolean;
  onCategoryChange: (value: string) => void;
  onSearchTextChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
};

export default function RepairSearchForm({
  category,
  searchText,
  district,
  parsing,
  parseError,
  loading,
  onCategoryChange,
  onSearchTextChange,
  onDistrictChange,
  onSubmit,
}: RepairSearchFormProps) {
  // Preferences are currently UI-only and are not sent to the backend.
  const [priority, setPriority] = useState("");

  return (
    <form
      id="search"
      onSubmit={onSubmit}
      className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-md"
    >
      <div className="flex flex-col gap-4">
        {/* Category selector and repair description */}
        <div>
          <label
            htmlFor="repair-search"
            className="block mb-2 text-xs font-medium uppercase tracking-widest text-brand-blue"
          >
            What needs fixing?
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center rounded-lg bg-brand-light focus-within:ring-2 focus-within:ring-brand-blue">
            <CategorySelect
              category={category}
              onCategoryChange={onCategoryChange}
            />

            <div className="mx-3 h-px bg-gray-300 sm:mx-0 sm:h-6 sm:w-px" />

            <input
              id="repair-search"
              type="text"
              value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)}
              placeholder="e.g. Broken coffee machine"
              className="w-full min-w-0 bg-transparent px-3 py-3 text-sm text-brand-navy outline-none sm:w-auto sm:flex-1"
            />
          </div>

          {/* Parser status and error */}
          {parsing && (
            <p role="status" className="mt-2 text-sm text-brand-blue">
              Analyzing your repair request...
            </p>
          )}

          {parseError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {parseError}
            </p>
          )}
        </div>

        {/* Munich district selection */}
        <DistrictSelect
          district={district}
          onDistrictChange={onDistrictChange}
        />

        {/* Optional preferences - not connected to the backend yet */}
        <div className="mt-4">
          <p className="mb-3 text-brand-navy">
            What matters most?
            <span className="ml-2 text-xs text-gray-500">OPTIONAL</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "nearest", label: "Nearest to me" },
              { value: "soonest", label: "Soonest available" },
              { value: "lowest_cost", label: "Lowest cost" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value)}
                aria-pressed={priority === option.value}
                className={`rounded-full border px-3 py-2 text-xs transition-colors ${
                  priority === option.value
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "bg-white text-brand-navy border-gray-200 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit repair search */}
        <button
          type="submit"
          disabled={loading || parsing}
          className="w-full bg-brand-orange text-brand-navy font-semibold rounded-lg px-4 py-3 hover:bg-brand-orange-hover disabled:opacity-50"
        >
          {loading ? "Loading..." : "Find a repair option"}
        </button>

        <p className="text-center text-xs text-gray-500">
          No account needed · Matches shown instantly
        </p>
      </div>
    </form>
  );
}
