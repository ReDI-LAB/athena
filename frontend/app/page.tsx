"use client";

import { useState } from "react";
import Field from "../components/Field";
import EstimationResult from "../components/EstimationResult";

import type { Estimation } from "../types/estimation";

export default function Home() {
  const [formData, setFormData] = useState({
    category: "",
    product_type: "",
    repair_type: "",
    postal_code: "",
    
  });
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<Estimation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [priority, setPriority] = useState("");

  // Update any form field
  function updateField(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedFormData = {
      category: formData.category.trim(),
      product_type: formData.product_type.trim(),
      repair_type: formData.repair_type.trim(),
      postal_code: formData.postal_code.trim(),
    };
    
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

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(
        "/api/estimations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trimmedFormData),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-navy">

      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 border-b">
       {/* TODO: Replace placeholder with Athena logo */}
        <div className="font-bold">logo</div>

       {/* TODO: Implement Find and Info navigation */}
        <div className="flex gap-4">
          <button type="button">Find</button>
          <button type="button">Info</button>
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        
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

        {/* Search Form */}
        <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="repair-search"
                    className="block mb-3 text-sm font-medium uppercase tracking-widest text-brand-blue"
                  >
                    What needs fixing?
                  </label>

                  <input
                    id="repair-search"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="e.g. My jeans have a broken zipper"
                    className="w-full bg-brand-light border-0 rounded-lg px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label
      htmlFor="category"
      className="block mb-2 text-sm font-medium text-brand-blue"
    >
      Category
    </label>

    <select
      id="category"
      value={formData.category}
      onChange={(e) => updateField("category", e.target.value)}
      className="w-full bg-brand-light rounded-lg px-4 py-3 text-brand-navy"
    >
      <option value="">Select category</option>
      <option value="textiles">Textiles</option>
      <option value="electronics">Electronics</option>
    </select>
  </div>

                <div>
                  <label
                    htmlFor="postal-code"
                    className="block mb-2 text-sm font-medium text-brand-blue"
                  >
                    Postal code
                  </label>

                  <input
                    id="postal-code"
                    type="text"
                    inputMode="numeric"
                    value={formData.postal_code}
                    onChange={(e) => updateField("postal_code", e.target.value)}
                    placeholder="e.g. 80331"
                    className="w-full bg-brand-light rounded-lg px-4 py-3 text-brand-navy"
                  />
                </div>
              </div>

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
                  { value: "volunteer", label: "Volunteer run" },
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
  
            <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange text-brand-navy font-semibold rounded-lg px-4 py-3 hover:bg-brand-orange-hover disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Find a repair option"}
            </button>

          </div>
        </form>

        {/* API Response */}
        {error && (
          <p role="alert" className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {data !== null && <EstimationResult data={data} />}

      </main>

      {/* Footer */}
      <footer className="border-t px-8 py-6">
        Footer
      </footer>

    </div>
  );
}
