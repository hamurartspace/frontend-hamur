"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import localFont from "next/font/local";

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

interface Exhibition {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  statusEvent: "current" | "upcoming";
  image?: {
    url: string;
  };
}

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState<"current" | "upcoming">("current");
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExhibitions() {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
        if (!baseUrl) {
          throw new Error(
            "ENV NEXT_PUBLIC_STRAPI_URL belum diset. Tambahkan di .env.local, mis: NEXT_PUBLIC_STRAPI_URL=https://stunning-dream-45c19f9694.strapiapp.com/"
          );
        }

        // populate tidak berpengaruh pada format kamu (sudah flat), tapi tidak masalah untuk dibiarkan
        const url = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/exhibitions?populate=image`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        const data = await res.json();
        // console.log("RAW:", JSON.stringify(data, null, 2)); // debug

        const formatted: Exhibition[] = (data?.data ?? []).map((item: any) => {
          const status = String(item?.statusEvent ?? "")
            .toLowerCase()
            .trim();
          // Image sudah absolute url dari Cloudinary
          const imgUrl = item?.image?.url ?? undefined;

          return {
            id: item?.id,
            title: item?.title ?? "Untitled",
            startDate: item?.startDate ?? "",
            endDate: item?.endDate ?? "",
            statusEvent:
              status === "current" || status === "upcoming"
                ? (status as "current" | "upcoming")
                : "current",
            image: imgUrl ? { url: imgUrl } : undefined,
          };
        });

        setExhibitions(formatted);
      } catch (err: any) {
        console.error("Failed to fetch exhibitions", err);
        setError(err?.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    }

    fetchExhibitions();
  }, []);

  const today = new Date();
  const filteredExhibitions = exhibitions.filter((ex) => {
    if (activeTab === "current") {
      if (ex.statusEvent !== "current") return false;
      const endDate = new Date(ex.endDate);
      return endDate >= today;
    } else if (activeTab === "upcoming") {
      return ex.statusEvent === "upcoming";
    }
    return false;
  });

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-64 max-w-8xl">
        <h1
          className={`sm:text-7xl text-4xl mb-6 ${montserrat.className} tracking-tighter text-[#546A51]`}
        >
          Exhibitions
        </h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeTab === "current"
                ? "bg-[#546A51] text-white"
                : "bg-white hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("current")}
          >
            Current Exhibition
          </button>
          <button
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeTab === "upcoming"
                ? "bg-[#546A51] text-white"
                : "bg-white hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Exhibition
          </button>
        </div>

        {/* States */}
        {loading && <p>Sedang memuat data...</p>}
        {error && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* Exhibition Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6">
            {filteredExhibitions.length === 0 ? (
              <p>Tidak ada {activeTab} exhibitions.</p>
            ) : (
              filteredExhibitions.map((exhibition) => (
                <div
                  key={exhibition.id}
                  className="border-none rounded-lg overflow-hidden shadow-xl bg-white text-black hover:shadow-lg transition-shadow duration-300"
                >
                  {exhibition.image ? (
                    <Image
                      src={exhibition.image.url}
                      alt={exhibition.title}
                      width={800}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200" />
                  )}
                  <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-2">
                      {exhibition.title}
                    </h2>
                    <p className="text-black">
                      {exhibition.startDate} hingga {exhibition.endDate}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
