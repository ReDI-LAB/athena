import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        {/* Athena brand */}
        <Link href="/" className="text-2xl font-bold text-brand-navy">
          athena<span className="text-brand-orange">.</span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center justify-center gap-6 sm:gap-12">
          <a
            href="#search"
            className="whitespace-nowrap text-sm font-bold text-black sm:text-lg"
          >
            Find a repair
          </a>

          <a
            href="#how-it-works"
            className="whitespace-nowrap text-sm font-normal text-black sm:text-lg"
          >
            How it works
          </a>
        </div>
      </nav>
    </header>
  );
}
