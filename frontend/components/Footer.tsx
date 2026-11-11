export default function Footer() {
  return (
    <footer className="w-full bg-[#4D6378] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="mb-5 text-lg font-bold">
              athena<span className="text-brand-orange">.</span>
            </p>
            <p className="max-w-xs text-sm text-gray-200">
              Find repair shops and Repair Cafés across Munich, and keep good
              things in use.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-300">
              Navigate
            </h3>
            <a href="#search" className="text-sm hover:underline">
              Find a repair
            </a>
            <a href="#how-it-works" className="text-sm hover:underline">
              How it works
            </a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-300">
              Legal
            </h3>
            <span className="text-sm">Imprint</span>
            <span className="text-sm">Privacy policy</span>
            <span className="text-sm">Contact</span>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/20 pt-8 text-xs text-gray-300 md:flex-row">
          <p>© 2026 Athena</p>
          <p>A repair-finding platform for Munich</p>
        </div>
      </div>
    </footer>
  );
}
