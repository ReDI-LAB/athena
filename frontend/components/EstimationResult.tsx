"use client";

import { useState } from "react";
import type { Estimation } from "../types/estimation";

type EstimationResultProps = {
  data: Estimation;
};

export default function EstimationResult({ data }: EstimationResultProps) {
  // Track the selected repair shop and whether all results are visible.
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Email form state
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);

  // Basic email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isEmailValid && hasConsent;

  const locations = data.recommended_locations ?? [];
  const visibleLocations = showAll ? locations : locations.slice(0, 3);

  return (
    <section className="mt-10 w-full max-w-5xl">
      {/* Search results heading */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-brand-blue">
          Your Matches
        </p>

        <h2 className="text-2xl font-bold text-brand-navy">
          {locations.length} repair options found
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Select a repair shop to continue.
        </p>
      </div>

      {/* Recommended repair shops */}
      {locations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleLocations.map((location) => {
              const isSelected = selectedShopId === location.id;

              return (
                <div
                  key={location.id}
                  className={`relative flex h-full min-h-56 flex-col rounded-xl border-2 bg-white p-5 shadow-sm transition-all ${
                    isSelected
                      ? "border-brand-blue shadow-md"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  {/* Selected shop indicator */}
                  {isSelected && (
                    <span className="absolute -top-3 right-4 rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white">
                      SELECTED
                    </span>
                  )}

                  {/* Shop information */}
                  <div className="mb-5">
                    <h3 className="mb-3 font-semibold leading-snug text-brand-navy">
                      {location.title}
                    </h3>

                    {(location.street ||
                      location.postal_code ||
                      location.city) && (
                      <p className="mb-3 text-sm text-gray-600">
                        {[location.street, location.postal_code, location.city]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {/* Link to the repair shop website, if available */}
                    {location.website?.trim().match(/^https?:\/\//i) && (
                      <a
                        href={location.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand-blue underline hover:no-underline"
                      >
                        Visit website
                      </a>
                    )}
                  </div>

                  {/* Select one repair shop */}
                  <button
                    type="button"
                    onClick={() => setSelectedShopId(location.id)}
                    aria-pressed={isSelected}
                    className={`mt-auto w-full rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                      isSelected
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-brand-blue bg-white text-brand-blue hover:bg-brand-light"
                    }`}
                  >
                    {isSelected ? "✓ Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expand or collapse additional repair shop results */}
          {locations.length > 3 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                aria-expanded={showAll}
                className="rounded-md border border-brand-blue px-6 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-white"
              >
                {showAll ? "Show fewer results" : "Show more results"}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-sm text-gray-600">
          No repair locations available yet.
        </p>
      )}
      {/* Email form — appears after selecting a repair shop */}
      {selectedShopId !== null &&
        (() => {
          const selectedShop = locations.find(
            (shop) => shop.id === selectedShopId,
          );

          if (!selectedShop) return null;

          return (
            <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl bg-white p-7 shadow-sm">
              {/* Selected repair shop */}
              <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-gray-100 px-4 py-3">
                <span className="text-lg text-blue-800">✓</span>
                <span className="text-sm font-bold text-[#08294A]">
                  {selectedShop.title}
                </span>
              </div>

              {/* Form heading */}
              <h3 className="mb-4 text-2xl font-bold leading-tight text-[#08294A]">
                Almost there — where should we send the details?
              </h3>

              <p className="mb-5 text-sm leading-relaxed text-gray-600">
                We'll email you the address, opening hours and contact for this
                shop, plus your CO₂ savings once it's repaired. No account
                needed.
              </p>

              {/* Email input */}
              <label
                htmlFor="contact-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#4D829D]"
              >
                Your Email
              </label>

              <div className="flex items-center gap-3 rounded-lg bg-[#EFF0EE] px-4 py-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#075782"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 6 10 7 10-7" />
                </svg>

                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-invalid={email.length > 0 && !isEmailValid}
                  className="w-full bg-transparent text-sm text-[#08294A] outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Consent */}
              <label className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-gray-600">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#075782]"
                />
                <span>
                  I agree to receive this shop's contact details and one
                  follow-up email about my repair. Unsubscribe anytime.{" "}
                  <span className="underline">Privacy policy</span>
                </span>
              </label>

              {/* Email sending requires backend integration */}
              {/* Email sending will be connected to the backend later */}
              <button
                type="button"
                disabled
                className={`mt-6 w-full cursor-not-allowed rounded-lg px-4 py-4 text-sm font-bold text-[#08294A] ${
                  isFormValid ? "bg-[#E88D27]" : "bg-[#E88D27] opacity-50"
                }`}
              >
                Send me the contact details
              </button>

              <p className="mt-2 text-center text-xs text-gray-500">
                {isFormValid
                  ? "Your form is ready. Email delivery is coming soon."
                  : "Enter a valid email and agree to continue."}
              </p>
            </div>
          );
        })()}
      {/* Overall repair estimation and environmental impact */}
      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-brand-navy">
          Repair & Environmental Impact
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-brand-light p-4">
            <p className="mb-2 text-sm text-gray-600">Estimated Repair Cost</p>
            <p className="text-xl font-bold text-brand-navy">
              {data.cost_min_eur != null && data.cost_max_eur != null
                ? `€${data.cost_min_eur} – €${data.cost_max_eur}`
                : "Not available"}
            </p>
          </div>

          <div className="rounded-lg bg-brand-light p-4">
            <p className="mb-2 text-sm text-gray-600">CO₂ Saved</p>
            <p className="text-xl font-semibold text-[#3E6B44]">
              {data.co2_saved_kg != null
                ? `${data.co2_saved_kg} kg`
                : "Not available"}
            </p>
          </div>

          <div className="rounded-lg bg-brand-light p-4">
            <p className="mb-2 text-sm text-gray-600">Waste Avoided</p>
            <p className="text-xl font-semibold text-[#3E6B44]">
              {data.waste_avoided_kg != null
                ? `${data.waste_avoided_kg} kg`
                : "Not available"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
