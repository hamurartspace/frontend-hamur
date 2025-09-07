"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import localFont from "next/font/local";

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

interface Program {
  id: number;
  titleProgram: string;
  start: string;
  end: string;
  programType: string;
  mediaProgram?: {
    url: string;
  };
}

export default function ProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("Workshop");

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
        if (!baseUrl) {
          throw new Error(
            "ENV NEXT_PUBLIC_STRAPI_URL belum diset. Tambahkan di .env.local, mis: NEXT_PUBLIC_STRAPI_URL=https://stunning-dream-45c19f9694.strapiapp.com/"
          );
        }
        const url = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/programs?populate=mediaProgram`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        const formatted: Program[] = (data?.data ?? []).map((item: any) => {
          const attrs = item?.attributes ?? item ?? {};
          const imgUrl =
            attrs?.mediaProgram?.data?.attributes?.url ??
            attrs?.mediaProgram?.url ??
            undefined;
          return {
            id: item?.id,
            titleProgram: attrs?.titleProgram ?? "Untitled",
            start: attrs?.start ?? "",
            end: attrs?.end ?? "",
            programType: attrs?.programType ?? "",
            mediaProgram: imgUrl ? { url: imgUrl } : undefined,
          };
        });

        // Filter program yang belum kadaluarsa
        const today = new Date();
        const notExpired = formatted.filter(
          (program) => new Date(program.end) >= today
        );

        setPrograms(notExpired);
      } catch (err: any) {
        setError(err?.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  const filteredPrograms = programs.filter(
    (program) => program.programType.toLowerCase() === activeType.toLowerCase()
  );

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-81 max-w-8xl">
        <h1
          className={`sm:text-7xl text-4xl mb-6 ${montserrat.className} tracking-tighter text-[#546A51]`}
        >
          Programs
        </h1>
        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeType === "Workshop"
                ? "bg-[#546A51] text-white"
                : "bg-white hover:bg-gray-300"
            }`}
            onClick={() => setActiveType("Workshop")}
          >
            Workshop
          </button>
          <button
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeType === "Residency"
                ? "bg-[#546A51] text-white"
                : "bg-white hover:bg-gray-300"
            }`}
            onClick={() => setActiveType("Residency")}
          >
            Residency
          </button>
        </div>
        {loading && <p>Sedang memuat data...</p>}
        {error && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6">
          {filteredPrograms.length === 0 && !loading && !error ? (
            <p>Tidak ada program {activeType.toLowerCase()}.</p>
          ) : (
            filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="border-none rounded-lg overflow-hidden shadow-xl bg-white text-black hover:shadow-lg transition-shadow duration-300"
              >
                {program.mediaProgram ? (
                  <Image
                    src={program.mediaProgram.url}
                    alt={program.titleProgram}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200" />
                )}
                <div className="p-4">
                  <h2 className="text-2xl font-semibold mb-2">
                    {program.titleProgram}
                  </h2>
                  <p className="text-black mb-1">
                    {program.start} hingga {program.end}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tipe: {program.programType}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
