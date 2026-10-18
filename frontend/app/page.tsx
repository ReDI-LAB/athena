"use client";

import { useState } from "react";
import Field from "../components/Field";
import EstimationResult from "../components/EstimationResult";

// Later, types to be outsourced these to a common file!!
type RepairLocation = {
  id: number;
  title: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  website: string | null;
};

type Estimation = {
  cost_min_eur: number;
  cost_max_eur: number;
  co2_saved_kg: number;
  waste_avoided_kg: number;
  recommended_locations: RepairLocation[];
};

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
  const [priority, setPriority] = useState("nearest");

  // Update any form field
  function updateField(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
        !formData.category.trim() ||
        !formData.product_type.trim() ||
        !formData.repair_type.trim()
      ) {
        setShowCategories(true);
        setData(null);
        setError(
          "Please provide a few more details about your item so we can find a repair option."
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
          body: JSON.stringify(formData),
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
    <div className="min-h-screen flex flex-col bg-white text-[#002040]">

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
          <p className="text-sm uppercase tracking-widest text-[#1D5673] mb-4">
            München · Reparieren statt Wegwerfen
          </p>

          <h1 className="text-4xl font-bold text-[#002040] mb-4">
            Fix your item, don&apos;t ditch it.
          </h1>

          <p className="text-[#1D5673]">
            Tell us what&apos;s broken, we&apos;ll match you
            with a repair shop nearby.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-lg bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="repair-search"
                    className="block mb-3 text-sm font-medium uppercase tracking-widest text-[#1D5673]"
                  >
                    What needs fixing?
                  </label>

                  <input
                    id="repair-search"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="e.g. My jeans have a broken zipper"
                    className="w-full bg-[#EBEDEA] border-0 rounded-lg px-4 py-3 text-[#002040] focus:outline-none focus:ring-2 focus:ring-[#1D5673]"
                  />
                </div> 
              <button
                  type="button"
                  onClick={() => setShowCategories(!showCategories)}
                  className="text-sm text-[#1D5673] hover:underline text-left"
                >
                  {showCategories ? "Hide categories ▲" : "Or select categories manually ▼"}
              </button>

          {showCategories && (
              <div className="flex flex-col gap-4">
                <Field
                    name="category"
                    label="Category"
                    value={formData.category}
                    onChange={updateField}
                    required
                  />

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

                  <Field
                    name="postal_code"
                    label="Postal Code"
                    value={formData.postal_code}
                    onChange={updateField}
                  />
             </div>
          )}
          
            <div className="mt-4">
              <p className="mb-3 text-[#002040]">
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
                        ? "bg-[#002040] text-white border-[#002040]"
                        : "bg-white text-[#002040] border-gray-200 hover:bg-gray-100"
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
                  className="w-full bg-[#E08A2C] text-[#002040] font-semibold rounded-lg px-4 py-3 hover:bg-[#D17C20] disabled:opacity-50"
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
