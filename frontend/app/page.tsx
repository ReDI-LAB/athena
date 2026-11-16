"use client";

import type { Estimation, ParsedSearchQuery } from "../types/estimation";
import { useState, useRef } from "react";

import EstimationResult from "../components/EstimationResult";
import RepairSearchForm from "../components/RepairSearchForm";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
  // Always keep track of the latest search text.
  const currentSearchTextRef = useRef("");

  // Identify outdated search requests.
  const searchRequestIdRef = useRef(0);

  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(
    null,
  );
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const [district, setDistrict] = useState("");

  // API response and request status.
  const [data, setData] = useState<Estimation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update a field while keeping the other form values unchanged.
  function updateField(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  // Reset previous parser values when the search text changes.
  function handleSearchTextChange(value: string) {
    currentSearchTextRef.current = value;

    // Invalidate requests started with the previous search text.
    searchRequestIdRef.current += 1;

    setParsing(false);
    setLoading(false);

    setSearchText(value);
    setParsedQuery(null);
    setParseError("");
    setData(null);
    setError("");

    setFormData((prev) => ({
      ...prev,
      category: "",
      product_type: "",
      repair_type: "",
      postal_code: "",
    }));
  }

  // Parse free text without starting the final repair lookup.
  async function handleParseSearch(): Promise<ParsedSearchQuery | null> {
    const query = searchText.trim();
    if (!query) return null;
    if (parsedQuery?.raw_query === query) return parsedQuery;

    // Give this parser request a unique ID.
    const requestId = ++searchRequestIdRef.current;

    setParsing(true);
    setParseError("");

    try {
      const response = await fetch(
        `/api/search/parse?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Could not analyze search text");

      const result: ParsedSearchQuery = await response.json();

      // Ignore outdated parser responses.
      if (
        requestId !== searchRequestIdRef.current ||
        currentSearchTextRef.current.trim() !== query ||
        result.raw_query.trim() !== query
      ) {
        return null;
      }

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
      if (
        requestId !== searchRequestIdRef.current ||
        currentSearchTextRef.current.trim() !== query
      ) {
        return null;
      }

      console.error(error);
      setParseError("Could not analyze your search. Please try again.");
      return null;
    } finally {
      if (
        requestId === searchRequestIdRef.current &&
        currentSearchTextRef.current.trim() === query
      ) {
        setParsing(false);
      }
    }
  }

  // Validate the form and request a repair estimation.
  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (parsing) return;

    const query = searchText.trim();
    const result = await handleParseSearch();

    // Stop if the search text has changed or the parser result is outdated.
    if (
      currentSearchTextRef.current.trim() !== query ||
      (result && result.raw_query.trim() !== query)
    ) {
      return;
    }

    if (query && !result) {
      return;
    }

    // Prepare the search parameters for the backend.
    // The district selected in "Where?" takes priority over a detected district.
    const trimmedFormData = {
      category: (formData.category || result?.detected_category || "").trim(),
      product_type: (result?.detected_product_type || "").trim(),
      repair_type: (result?.detected_repair_type || "").trim(),
      district: (district.trim() || result?.detected_district || "").trim(),
    };

    // The current backend still requires these three fields.
    if (
      !trimmedFormData.category ||
      !trimmedFormData.product_type ||
      !trimmedFormData.repair_type
    ) {
      setData(null);
      setError(
        "We couldn't identify your repair request. Try describing what item is broken and what needs fixing, for example: 'My jeans zipper is broken'.",
      );
      return;
    }

    // Reset previous results before sending a new request.
    setLoading(true);
    setError("");
    setData(null);

    // Track the current request.
    const requestId = searchRequestIdRef.current;

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

      const estimationResult = await response.json();

      // Ignore results from outdated requests.
      if (requestId !== searchRequestIdRef.current) return;

      setData(estimationResult);
    } catch (error) {
      if (requestId !== searchRequestIdRef.current) return;

      // Display an error if the request fails.
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setLoading(false);
      }
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
        <RepairSearchForm
          category={formData.category}
          searchText={searchText}
          district={district}
          parsing={parsing}
          parseError={parseError}
          loading={loading}
          onCategoryChange={(value) => updateField("category", value)}
          onSearchTextChange={handleSearchTextChange}
          onDistrictChange={setDistrict}
          onSubmit={handleSearch}
        />
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
