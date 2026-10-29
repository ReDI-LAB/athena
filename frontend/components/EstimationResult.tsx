
import type { Estimation } from "../types/estimation";

type EstimationResultProps = {
  data: Estimation;
};

export default function EstimationResult({
  data,
}: EstimationResultProps) {
  return (
    <section className="w-full max-w-2xl mt-8">
      <h2 className="text-2xl font-bold text-brand-navy mb-4">
        Your Repair Estimation
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-sm">
          Estimated Repair Cost
        </p>

        <p className="text-3xl font-bold text-brand-navy mb-6">
          {data.cost_min_eur != null && data.cost_max_eur != null
            ? `€${data.cost_min_eur} – €${data.cost_max_eur}`
            : "Not available"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-light rounded-lg p-4">
            <p className="text-sm text-gray-600">
              CO₂ Saved
            </p>
            <p className="text-xl font-semibold text-[#3E6B44]">
              {data.co2_saved_kg != null
                ? `${data.co2_saved_kg} kg`
                : "Not available"}
            </p>
          </div>

          <div className="bg-brand-light rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Waste Avoided
            </p>
            <p className="text-xl font-semibold text-[#3E6B44]">
              {data.waste_avoided_kg != null
                ? `${data.waste_avoided_kg} kg`
                : "Not available"}
            </p>
          </div>
        </div>
      </div>

            <div className="mt-6">
            <h3 className="text-xl font-bold text-brand-navy mb-4">
                Recommended Repair Locations
            </h3>

            {data.recommended_locations?.length > 0 ? (
                <div className="flex flex-col gap-4">
                        {data.recommended_locations.map((location) => (
                            <div
                            key={location.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                            >
                            <h4 className="font-semibold text-brand-navy mb-2">
                                {location.title}
                            </h4>

                            {(location.street ||
                                location.postal_code ||
                                location.city) && (
                                <p className="text-sm text-gray-600 mb-2">
                                {[location.street, location.postal_code, location.city]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                            )}

                            {location.website?.trim().match(/^https?:\/\//i) ? (
                            <a
                                href={location.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-brand-blue underline"
                            >
                                Visit website
                            </a>
                            ) : null}
                    </div>
            ))}
                </div>
                    ) : (
                        <p className="text-sm text-gray-600">
                        No repair locations available yet.
                        </p>
                    )}
             </div>
    </section>
  );
}
