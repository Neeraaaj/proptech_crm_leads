import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-lg font-medium">Page not found</p>
      <Link href="/" className="text-indigo-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}
