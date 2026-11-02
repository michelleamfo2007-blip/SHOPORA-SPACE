import { db } from "@/lib/db"
import { ZoneForm } from "./ZoneForm"
import { SeedZonesButton } from "./SeedZonesButton"
import { DeleteZoneButton } from "./DeleteZoneButton"

export default async function DeliveryZonesPage() {
  const zones = await db.deliveryZone.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Delivery zones</h1>
        <p className="mt-1 text-slate-500">
          Accra areas that adjust the live delivery fee. Keywords match the customer dropoff address
          (e.g. “east legon” → East Legon / Airport zone).
        </p>
      </div>

      {zones.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
          <p className="text-sm text-slate-600">No zones yet. Seed Accra defaults or add your own.</p>
          <div className="mt-4 flex justify-center">
            <SeedZonesButton />
          </div>
        </div>
      )}

      <ZoneForm />

      <div className="space-y-3">
        {zones.map((zone) => (
          <article key={zone.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {zone.name}{" "}
                  <span className="text-xs font-medium text-slate-500">
                    {zone.isActive ? "· Active" : "· Off"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Keywords: {zone.keywords}</p>
                <p className="mt-1 text-sm text-slate-700">
                  ×{zone.feeMultiplier}
                  {zone.flatAdd ? ` · +GHS ${zone.flatAdd}` : ""}
                  {zone.minFee != null ? ` · min ${zone.minFee}` : ""}
                  {zone.maxFee != null ? ` · max ${zone.maxFee}` : ""}
                </p>
              </div>
              <DeleteZoneButton zoneId={zone.id} />
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-slate-500">Edit</summary>
              <div className="mt-3">
                <ZoneForm zone={zone} />
              </div>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}
