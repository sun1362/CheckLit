
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 text-4xl">
          🛒
        </div>

        <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Page Not Found
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          The page you are looking for does not exist or may have been moved.
          Return to CheckLit and continue organizing your shopping lists.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-lg bg-green-700 px-6 py-3 text-center font-semibold text-white transition hover:bg-green-800"
          >
            Back to Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
