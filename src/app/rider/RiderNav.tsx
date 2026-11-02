import Link from "next/link"

const links = [
  { href: "/rider", label: "Jobs" },
  { href: "/rider/earnings", label: "Earnings" },
  { href: "/rider/history", label: "History" },
]

export function RiderNav({ active }: { active: "jobs" | "earnings" | "history" }) {
  return (
    <nav className="flex gap-1 border-b border-stone-200">
      {links.map((l) => {
        const isActive =
          (active === "jobs" && l.href === "/rider") ||
          (active === "earnings" && l.href === "/rider/earnings") ||
          (active === "history" && l.href === "/rider/history")
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-3 text-sm ${
              isActive ? "border-b-2 border-stone-900 font-medium text-stone-900" : "text-stone-500"
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
