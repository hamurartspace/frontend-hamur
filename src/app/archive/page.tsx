"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";

// Font
const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

// Types
type StatusEvent = "current" | "upcoming" | "archived";

interface Exhibition {
  id: number;
  title: string;
  slug: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  statusEvent: StatusEvent;
  description?: string;
  coverImage?: { url: string };
}

// Utils (file-Scoped)
function mapExhibitions(json: any): Exhibition[] {
  const rows = json?.data ?? [];
  return rows.map((item: any) => {
    const attrs = item?.attributes ?? item ?? {};
    const statusRaw = String(attrs?.statusEvent ?? item?.statusEvent ?? "")
      .toLowerCase()
      .trim();

    const statusEvent: StatusEvent =
      statusRaw === "current" ||
      statusRaw === "upcoming" ||
      statusRaw === "archived"
        ? (statusRaw as StatusEvent)
        : "current";

    const cover =
      attrs?.coverImage?.data?.attributes?.url ??
      attrs?.coverImage?.url ??
      undefined;

    return {
      id: item?.id,
      title: attrs?.title ?? item?.title ?? "Untitled",
      slug: attrs?.slug ?? item?.slug ?? "",
      startDate: attrs?.startDate ?? item?.startDate ?? "",
      endDate: attrs?.endDate ?? item?.endDate ?? "",
      statusEvent,
      description: attrs?.description ?? item?.description ?? "",
      coverImage: cover ? { url: cover } : undefined,
    };
  });
}

function resolveImageUrl(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  return `${baseUrl.replace(/\/+$/, "")}${url}`;
}

export default function ArchivePage() {
  const [items, setItems] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Atur jika mau auto-refresh (ms). Set 0 untuk mematikan.
  const REFRESH_MS = 0;

  useEffect(() => {
    let alive = true;

    async function fetchArchive() {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
        if (!baseUrl) {
          throw new Error(
            "ENV NEXT_PUBLIC_STRAPI_URL belum diset. Tambahkan di .env.local"
          );
        }

        const url = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/collection-exhibitions?populate=coverImage`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        const json = await res.json();
        const formatted = mapExhibitions(json);
        if (alive) setItems(formatted);
      } catch (err: any) {
        if (alive) setError(err?.message || "Gagal memuat data arsip");
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchArchive();

    let interval: number | undefined;
    if (REFRESH_MS && REFRESH_MS > 0) {
      interval = window.setInterval(fetchArchive, REFRESH_MS);
    }
    return () => {
      alive = false;
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  const today = new Date();

  const archived = useMemo(() => {
    return items.filter((ex) => {
      const end = new Date(ex.endDate);
      // Prioritas: statusEvent archived
      if (ex.statusEvent === "archived") return true;
      // Fallback: endDate sudah lewat
      return end < today;
    });
  }, [items]);

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-81 max-w-8xl">
        <h1
          className={`sm:text-7xl text-4xl mb-6 ${montserrat.className} tracking-tighter text-[#546A51]`}
        >
          Archive
        </h1>

        {/* States */}
        {loading && <p>Sedang memuat data...</p>}
        {error && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {archived.length === 0 ? (
              <p>Tidak ada arsip exhibition.</p>
            ) : (
              archived.map((ex) => {
                const img = resolveImageUrl(ex.coverImage?.url);
                return (
                  <div
                    key={ex.id}
                    onClick={() => router.push(`/exhibition/${ex.slug}`)}
                    className="cursor-pointer border-none rounded-lg overflow-hidden shadow-xl bg-white text-black hover:shadow-lg transition-shadow duration-300"
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={ex.title}
                        width={800}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200" />
                    )}
                    <div className="p-4">
                      <h2 className="text-2xl font-semibold mb-2">
                        {ex.title}
                      </h2>
                      <p className="text-black">
                        {ex.startDate} hingga {ex.endDate}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
