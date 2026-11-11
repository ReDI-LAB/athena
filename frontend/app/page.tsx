"use client";

import { useState, useEffect, useRef } from "react";
import EstimationResult from "../components/EstimationResult";
import { MapPin } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import type { Estimation, ParsedSearchQuery } from "../types/estimation";

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
  // Values required by the estimation API; product and repair type remain hidden.
  const [formData, setFormData] = useState({
    category: "",
    product_type: "",
    repair_type: "",
    postal_code: "",
  });

  // Free-text query analyzed by the parser endpoint.
  const [searchText, setSearchText] = useState("");

  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(
    null,
  );
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const [district, setDistrict] = useState("");
  // Controls the visibility of the location suggestions.
  const [locationOpen, setLocationOpen] = useState(false);

  // Filter Munich districts based on the user's input.
  const filteredDistricts = munichDistricts.filter((name) =>
    name.toLowerCase().includes(district.trim().toLowerCase()),
  );

  // API response and request status.
  const [data, setData] = useState<Estimation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Optional preference selection (not yet sent to backend).
  const [priority, setPriority] = useState("");

  // Controls the custom category dropdown.
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Reference to the location input and dropdown.
  const locationRef = useRef<HTMLDivElement>(null);

  // Reference to the category dropdown.
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close location suggestions when clicking outside.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
      // Close category dropdown when clicking outside.
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update a field while keeping the other form values unchanged.
  function updateField(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Parse free text without starting the final repair lookup.
  async function handleParseSearch(): Promise<ParsedSearchQuery | null> {
    const query = searchText.trim();
    if (!query) return null;
    if (parsedQuery?.raw_query === query) return parsedQuery;

    setParsing(true);
    setParseError("");

    try {
      const response = await fetch(
        `/api/search/parse?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Could not analyze search text");

      const result: ParsedSearchQuery = await response.json();
      setParsedQuery(result);
      setFormData((prev) => ({
        ...prev,
        // Keep the user's explicit category choice when one is selected.
        category: prev.category || result.detected_category || "",
        product_type: result.detected_product_type || "",
        repair_type: result.detected_repair_type || "",
        postal_code: result.postal_code || "",
      }));
      return result;
    } catch (error) {
      console.error(error);
      setParseError("Could not analyze your search. Please try again.");
      return null;
    } finally {
      setParsing(false);
    }
  }

  // Validate the form and request a repair estimation.
  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (parsing) return;

    const result = await handleParseSearch();

    if (searchText.trim() && !result) {
      setError("Could not analyze your search. Please try again.");
      return;
    }
    // Use the latest parsed values for the repair search.
    const trimmedFormData = {
      category: (formData.category || result?.detected_category || "").trim(),

      product_type: (result?.detected_product_type || "").trim(),

      repair_type: (result?.detected_repair_type || "").trim(),

      postal_code: (result?.postal_code || formData.postal_code).trim(),
    };

    // The current backend still requires these three fields.
    if (
      !trimmedFormData.category ||
      !trimmedFormData.product_type ||
      !trimmedFormData.repair_type
    ) {
      setData(null);
      setError(
        "We couldn’t identify enough repair details from your description. Please describe the item and problem more specifically, then try again.",
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
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-navy">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-10">
        {/* Introductory text */}
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-brand-blue mb-4">
            München · Reparieren statt Wegwerfen
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy text-center">
            Fix your item, don&apos;t ditch it.
          </h1>

          <p className="mt-4 text-brand-blue">
            Tell us what&apos;s broken, we&apos;ll match you with a repair shop
            nearby.
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

              <div className="flex flex-col sm:flex-row sm:items-center rounded-lg bg-brand-light focus-within:ring-2 focus-within:ring-brand-blue">
                {/* Custom category dropdown */}
                <div
                  ref={categoryRef}
                  className="relative z-50 w-full sm:w-36 shrink-0"
                >
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
                        (category) => category.value === formData.category,
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
                            <span
                              className="ml-2 text-brand-blue"
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Responsive separator */}
                <div className="mx-3 h-px bg-gray-300 sm:mx-0 sm:h-6 sm:w-px" />

                {/* TODO: Connect free-text search to backend */}
                <input
                  id="repair-search"
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setParsedQuery(null);
                    setParseError("");
                    setData(null);
                    setError("");
                    // Prevent old parser values from being reused for a new query.
                    setFormData((prev) => ({
                      ...prev,
                      product_type: "",
                      repair_type: "",
                      postal_code: "",
                    }));
                  }}
                  placeholder="e.g. Broken coffee machine"
                  className="w-full min-w-0 bg-transparent px-3 py-3 text-sm text-brand-navy outline-none sm:w-auto sm:flex-1"
                />
              </div>
              {/* Parser loading and error messages */}
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
            {/* Munich district search */}
            <div>
              <label
                htmlFor="district"
                className="block mb-2 text-sm font-medium uppercase tracking-widest text-brand-blue"
              >
                Where?
              </label>

              <div ref={locationRef} className="relative z-10">
                {/* Location input */}
                <MapPin
                  size={18}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="absolute left-3 top-6 -translate-y-1/2 text-brand-navy"
                />

                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDistrict(value);
                    setLocationOpen(true);
                  }}
                  onFocus={() => setLocationOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setLocationOpen(false);
                    }
                  }}
                  placeholder="e.g. Maxvorstadt"
                  autoComplete="off"
                  className="w-full bg-brand-light rounded-lg pl-10 pr-4 py-3 text-brand-navy"
                />

                {/* Custom location suggestions */}
                {locationOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                    {/* Current location */}
                    <button
                      type="button"
                      disabled
                      className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold text-brand-blue disabled:cursor-not-allowed"
                    >
                      <MapPin size={18} aria-hidden="true" />
                      Use my current location
                    </button>

                    {/* District suggestions */}
                    {district.trim().length >= 2 && (
                      <>
                        <div className="my-2 border-t border-gray-200" />

                        <p className="px-3 mt-2 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                          Districts
                        </p>

                        <div className="max-h-52 overflow-y-auto">
                          {filteredDistricts.length > 0 ? (
                            filteredDistricts.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setDistrict(name);
                                  setLocationOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm text-brand-navy hover:bg-brand-light"
                              >
                                <span className="text-sm font-medium text-brand-navy">
                                  {name}
                                </span>

                                <span className="ml-auto text-xs text-gray-500">
                                  District {munichDistricts.indexOf(name) + 1}
                                </span>

                                {district === name && (
                                  <span
                                    className="ml-2 text-brand-blue"
                                    aria-hidden="true"
                                  >
                                    ✓
                                  </span>
                                )}
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-3 text-sm text-gray-500">
                              No districts found
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Optional repair preferences (UI only for now) */}
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
            {/* Submit estimation request */}
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

        {/* Request error message */}
        {error && (
          <p role="alert" className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {/* Estimation results returned by the backend */}
        {data !== null && <EstimationResult data={data} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
