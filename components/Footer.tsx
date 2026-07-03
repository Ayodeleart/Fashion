export default function Footer({ brandName }: { brandName: string }) {
  return (
    <footer className="bg-ink text-paper px-6 md:px-10 py-14 md:py-16">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        <div>
          <p className="font-display text-2xl mb-2">{brandName}</p>
          <p className="text-sm text-paper/60 max-w-xs">
            Cut for movement, made to be seen from every angle.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-paper/50 mb-3">Shop</p>
            <ul className="space-y-2">
              <li><a href="/catalog" className="hover:text-brass transition-colors">New Arrivals</a></li>
              <li><a href="/catalog" className="hover:text-brass transition-colors">The Edit</a></li>
            </ul>
          </div>
          <div>
            <p className="text-paper/50 mb-3">Help</p>
            <ul className="space-y-2">
              <li><a href="/shipping" className="hover:text-brass transition-colors">Shipping</a></li>
              <li><a href="/returns" className="hover:text-brass transition-colors">Returns</a></li>
            </ul>
          </div>
          <div>
            <p className="text-paper/50 mb-3">Company</p>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-brass transition-colors">About</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-14 pt-6 border-t border-paper/10 text-xs text-paper/40 flex justify-between">
        <span>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</span>
        <span>Made with care.</span>
      </div>
    </footer>
  );
}
