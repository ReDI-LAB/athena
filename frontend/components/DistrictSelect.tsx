"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";

type DistrictSelectProps = {
  district: string;
  onDistrictChange: (value: string) => void;
};

export default function DistrictSelect({
  district,
  onDistrictChange,
}: DistrictSelectProps) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Load Munich districts from the backend.
  useEffect(() => {
    async function loadDistricts() {
      try {
        const response = await fetch("/api/options/districts");

        if (!response.ok) {
          throw new Error("Could not load Munich districts");
        }

        const result: string[] = await response.json();
        setDistricts(result);
      } catch (error) {
        console.error("Failed to load districts:", error);
      }
    }

    loadDistricts();
  }, []);

  // Close suggestions when clicking outside.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter suggestions based on the user's input.
  const filteredDistricts = districts.filter((name) =>
    name.toLowerCase().includes(district.trim().toLowerCase()),
  );

  return (
    <div>
      <label
        htmlFor="district"
        className="block mb-2 text-sm font-medium uppercase tracking-widest text-brand-blue"
      >
        Where?
      </label>

      <div ref={locationRef} className="relative z-10">
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
            onDistrictChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="e.g. Maxvorstadt"
          autoComplete="off"
          className="w-full bg-brand-light rounded-lg pl-10 pr-12 py-3 text-brand-navy"
        />
        {/* Clear selected district */}
        {district && (
          <button
            type="button"
            onClick={() => {
              onDistrictChange("");
              setIsOpen(false);
            }}
            aria-label="Clear district"
            title="Clear district"
            className="absolute right-3 top-6 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-brand-navy"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {/* Location suggestions */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold text-brand-blue disabled:cursor-not-allowed"
            >
              <MapPin size={18} aria-hidden="true" />
              Use my current location
            </button>

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
                          onDistrictChange(name);
                          setIsOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm text-brand-navy hover:bg-brand-light"
                      >
                        <span className="text-sm font-medium">{name}</span>

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
  );
}
