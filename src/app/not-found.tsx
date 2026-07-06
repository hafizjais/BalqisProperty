import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-copper">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-espresso">
        Page not found
      </h1>
      <p className="mt-2 text-warm-grey">
        This listing may have been sold or removed. Browse the latest
        properties instead.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back to Home</Button>
        <Button variant="secondary" href="/buy">
          Browse Listings
        </Button>
      </div>
    </div>
  );
}
