import { productIdentity } from "@/lib/product-identity";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Apps for Your Life
      </p>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        {productIdentity.name}
      </h1>
      <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700">
        {productIdentity.promise}
      </p>
      <p className="mt-10 text-sm text-slate-500">
        Product implementation is starting from a verified repository baseline.
      </p>
    </main>
  );
}
