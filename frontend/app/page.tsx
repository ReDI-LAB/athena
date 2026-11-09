
"use client";

import { useState } from "react";
import Field from "../components/Field";
import EstimationResult from "../components/EstimationResult";
import { MapPin } from "lucide-react";

import type { Estimation } from "../types/estimation";

// Munich districts used for location autocomplete.
// TODO: Replace with backend data when district search is supported.
const munichDistricts = [
  "Altstadt-Lehel",
  "Ludwigsvorstadt-Isarvorstadt",
  "Maxvorstadt",
  "Schwabing-West",
  "Au-Haidhausen",
  "Sendling",
  "Sendling-Westpark",
  "Schwanthalerhöhe",
  "Neuhausen-Nymphenburg",
  "Moosach",
  "Milbertshofen-Am Hart",
  "Schwabing-Freimann",
  "Bogenhausen",
  "Berg am Laim",
  "Trudering-Riem",
  "Ramersdorf-Perlach",
  "Obergiesing-Fasangarten",
  "Untergiesing-Harlaching",
  "Thalkirchen-Obersendling-Forstenried-Fürstenried-Solln",
  "Hadern",
  "Pasing-Obermenzing",
  "Aubing-Lochhausen-Langwied",
  "Allach-Untermenzing",
  "Feldmoching-Hasenbergl",
  "Laim",
];

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

export default function Home() {
  // Form values required by the current estimation API.
  const [formData, setFormData] = useState({
    category: "",
    product_type: "",
    repair_type: "",
    postal_code: "",
  });

  // New search fields (not yet connected to the backend).
  const [searchText, setSearchText] = useState("");
  const [district, setDistrict] = useState("");

  // API response and request status.
  const [data, setData] = useState<Estimation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI state for manual repair details and priority selection.
  const [showCategories, setShowCategories] = useState(false);
  const [priority, setPriority] = useState("");

  // Controls the custom category dropdown.
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Update a field while keeping the other form values unchanged.
  function updateField(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Validate the form and request a repair estimation.
  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    // Remove unnecessary spaces before validation and submission.
    const trimmedFormData = {
      category: formData.category.trim(),
      product_type: formData.product_type.trim(),
      repair_type: formData.repair_type.trim(),
      postal_code: formData.postal_code.trim(),
    };

    // The current backend still requires these three fields.
    if (
      !trimmedFormData.category ||
      !trimmedFormData.product_type ||
      !trimmedFormData.repair_type
    ) {
      setShowCategories(true);
      setData(null);
      setError(
        "Almost there! Please select the category, product and repair type to continue."
      );
      return;
    }

    // Reset previous results before sending a new request.
    setLoading(true);
    setError("");
    setData(null);

    try {
      // Next.js API route forwards the request to the FastAPI backend.
      const response = await fetch("/api/estimations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trimmedFormData),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      // Display an error if the request fails.
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-navy">
      {/* Header navigation */}
      <nav className="flex justify-between items-center px-8 py-4 border-b">
        {/* TODO: Replace placeholder with Athena logo */}
        <div className="font-bold">logo</div>

        {/* TODO: Implement navigation links */}
        <div className="flex gap-4">
          <button type="button">Find</button>
          <button type="button">Info</button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-10">
        {/* Introductory text */}
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-brand-blue mb-4">
            München · Reparieren statt Wegwerfen
          </p>

          <h1 className="text-4xl font-bold text-brand-navy mb-4">
            Fix your item, don&apos;t ditch it.
          </h1>

          <p className="text-brand-blue">
            Tell us what&apos;s broken, we&apos;ll match you
            with a repair shop nearby.
          </p>
        </div>

        {/* Repair search form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex flex-col gap-4">
            {/* Combined category selector and free-text input */}
            <div>
              <label
                htmlFor="repair-search"
                className="block mb-2 text-xs font-medium uppercase tracking-widest text-brand-blue"
              >
                What needs fixing?
              </label>

              <div className="flex items-center rounded-lg bg-brand-light focus-within:ring-2 focus-within:ring-brand-blue">
              {/* Custom category dropdown */}
                <div className="relative w-36 shrink-0">
                  <button
                    type="button"
                    aria-label="Select category"
                    aria-expanded={categoryOpen}
                    aria-controls="category-options"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="flex w-full items-center justify-between px-3 py-3 text-xs font-semibold text-brand-navy"
                  >
                    <span>
                      {categories.find(
                        (category) => category.value === formData.category
                      )?.label ?? "All categories"}
                    </span>

                    <span aria-hidden="true">⌄</span>
                  </button>

                  {/* Show category options when dropdown is open */}
                  {categoryOpen && (
                    <div
                      id="category-options"
                      className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
                    >
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            updateField("category", category.value);
                            setCategoryOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-brand-light"
                        >
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold text-brand-navy">
                              {category.label}
                            </span>

                            <span className="text-xs text-gray-500">
                              {category.description}
                            </span>
                          </span>

                          {/* Checkmark for selected category */}
                          {formData.category === category.value && (
                            <span className="ml-2 text-brand-blue" aria-hidden="true">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual separator */}
                <div className="h-6 w-px bg-gray-300" />

                {/* TODO: Connect free-text search to backend */}
                <input
                  id="repair-search"
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="e.g. My coffee machine is taking so long to work"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-brand-navy outline-none"
                />
              </div>
            </div>

            {/* Munich district search */}
            <div>
              <label
                htmlFor="district"
                className="block mb-2 text-sm font-medium uppercase tracking-widest text-brand-blue"
              >
                Where?
              </label>

              <div className="relative">
                {/* Location icon */}
                <MapPin
                  size={18}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy"
                />

                {/* District autocomplete using native HTML datalist */}
                <input
                  id="district"
                  type="text"
                  list="munich-districts"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Maxvorstadt"
                  className="w-full bg-brand-light rounded-lg pl-10 pr-4 py-3 text-brand-navy"
                />
              </div>

              <datalist id="munich-districts">
                {munichDistricts.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            {/* Manual fields required until free-text search is available */}
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="text-sm text-brand-blue hover:underline text-left"
            >
              {showCategories
                ? "Hide repair details ▲"
                : "Select product and repair type ▼"}
            </button>

            {showCategories && (
              <div className="flex flex-col gap-4">
                <Field
                  name="product_type"
                  label="Product Type"
                  value={formData.product_type}
                  onChange={updateField}
                  required
                />

                <Field
                  name="repair_type"
                  label="Repair Type"
                  value={formData.repair_type}
                  onChange={updateField}
                  required
                />
              </div>
            )}

            {/* Optional repair preferences (UI only for now) */}
            <div className="mt-4">
              <p className="mb-3 text-brand-navy">
                What matters most?
                <span className="ml-2 text-xs text-gray-500">
                  OPTIONAL
                </span>
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

            {/* Submit estimation request */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-brand-navy font-semibold rounded-lg px-4 py-3 hover:bg-brand-orange-hover disabled:opacity-50"
            >
              {loading ? "Loading..." : "Find a repair option"}
            </button>

            <p className="text-center text-xs text-gray-500">
              No account needed · Matches shown instantly
            </p>
          </div>
        </form>

        {/* Request error message */}
        {error && (
          <p role="alert" className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {/* Estimation results returned by the backend */}
        {data !== null && <EstimationResult data={data} />}
      </main>

      {/* Footer placeholder */}
      <footer className="border-t px-8 py-6">
        Footer
      </footer>
    </div>
  );
}
