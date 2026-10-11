"use client";

import { useState } from "react";
import Field from "../components/Field";

export default function Home() {
  const [formData, setFormData] = useState({
    category: "textiles",
    product_type: "jeans",
    repair_type: "zipper",
    postal_code: "80339",
  });

  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update any form field
  function updateField(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

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
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

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

        <h1 className="text-2xl font-bold mb-2">
          Repair Shop
        </h1>

        <p className="text-gray-600 mb-8">
          Find a repair service
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-sm"
        >
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Send Request"}
            </button>

          </div>
        </form>

        {/* API Response */}
        {error && (
          <p role="alert" className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {data !== null && (
          <div className="w-full max-w-md mt-8">
            <h2 className="font-bold mb-2">
              API Response
            </h2>

            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t px-8 py-6">
        Footer
      </footer>

    </div>
  );
}
