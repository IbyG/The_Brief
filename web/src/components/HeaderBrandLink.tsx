"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function HeaderBrandLink() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const href = qs ? `/?${qs}` : "/";

  return (
    <Link href={href} className="text-xl font-black tracking-tighter text-primary">
      The Brief
    </Link>
  );
}
