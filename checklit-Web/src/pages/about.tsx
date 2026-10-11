
const features = [
  {
    icon: '🛒',
    title: 'Shopping Lists',
    description:
      'Create and organize shopping lists, add products from the catalog, and adjust quantities to estimate your costs.',
  },
  {
    icon: '💰',
    title: 'Budget Tracking',
    description:
      'Set an optional budget for each list and compare your budget with the estimated cost of your items.',
  },
  {
    icon: '✅',
    title: 'Purchase Tracking',
    description:
      'Mark items as purchased and track list progress from pending to in progress and completed.',
  },
  {
    icon: '📊',
    title: 'Shopping Analytics',
    description:
      'Review spending based on recorded purchase dates and view monthly totals by day and product category.',
  },
  {
    icon: '📦',
    title: 'Product Catalog',
    description:
      'Browse catalog products and their current prices. Administrators can manage products and categories.',
  },
  {
    icon: '👤',
    title: 'Account Management',
    description:
      'Registered users can update their profile name, change their password, and access their saved shopping lists.',
  },
];

export function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="overflow-hidden rounded-2xl bg-green-800 px-6 py-12 text-white sm:px-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl">
              🛒
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
              About CheckLit
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Smarter Shopping Starts Here
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-green-50 sm:text-lg">
              CheckLit is a shopping list and budget tracking application
              designed to help users organize products, estimate expenses,
              record purchases, and understand their shopping spending.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              What You Can Do with CheckLit
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              CheckLit brings essential shopping tools together in one place,
              making it easier to plan purchases and keep track of expenses.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Designed for Your Shopping Needs
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                Whether you are preparing a grocery list, tracking purchases,
                or reviewing your monthly spending, CheckLit helps keep your
                shopping information organized.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Plan your list
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Choose catalog products and set the quantities you need.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Track your purchases
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Mark items as purchased to keep your list up to date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Review your spending
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Use monthly analytics to review the purchases recorded in
                    your completed shopping lists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-4 text-center">
          <p className="text-sm text-gray-500">
            CheckLit — Plan better, shop smarter, and track your spending.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default AboutPage;
