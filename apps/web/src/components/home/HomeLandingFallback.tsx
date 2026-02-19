import { Link } from 'react-router-dom';

const cards = [
  { title: 'Explore Categories', description: 'Browse curated categories and filters.', href: '/category' },
  { title: 'Shop Products', description: 'See products with detailed reviews.', href: '/product' },
  { title: 'Search Everything', description: 'Find what you need quickly via search.', href: '/search' },
  { title: 'View Cart', description: 'Review your selections and update quantities.', href: '/cart' },
  { title: 'Checkout Securely', description: 'Choose delivery, payment, and complete your order.', href: '/checkout' },
  { title: 'Manage Account', description: 'Access dashboard, addresses, orders, wishlist.', href: '/account/dashboard' },
];

const highlights = [
  'Fast delivery across Vietnam with real-time slot selection.',
  'Verified products with DNR / Alcohol handling built in.',
  'Multiple payment methods: COD, Momo, VNPay, ZaloPay, plus COD.',
];

export default function HomeLandingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-10 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to MM Vietnam</h1>
        <p className="text-lg opacity-90 mb-6">
          Discover curated categories, trusted products, and checkout with support for Vietnam-specific
          delivery and payment flows.
        </p>
        <Link
          to="/category"
          className="inline-flex items-center gap-2 rounded-full bg-white text-blue-600 px-6 py-3 font-semibold shadow-lg shadow-blue-500/40"
        >
          Start browsing categories
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Why shop with us?</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm shadow-gray-200/70"
            >
              <p className="text-gray-700 leading-relaxed">{highlight}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Expected journeys</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <h3 className="text-xl font-semibold mb-1 text-gray-900">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
              <span className="mt-4 inline-flex items-center text-blue-600 font-semibold">
                Go to page →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
