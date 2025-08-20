"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import ReactMarkdown from "react-markdown";

const rivanna = localFont({
  src: "../../../public/fonts/RivannaNF.woff2",
  display: "swap",
});

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
  display: "swap",
});

interface AboutData {
  judulAbout: string;
  isiAbout: string;
  imageAbout?: { url: string };
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl =
  process.env.NEXT_PUBLIC_STRAPI_URL || 
  "https://stunning-dream-45c19f9694.strapiapp.com/";

  const [requestUrl, setRequestUrl] = useState("");
  useEffect(() => {
    async function fetchAbout() {
      try {
        setLoading(true);
        setError(null);

        const url = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/abouts?populate=imageAbout`;
        setRequestUrl(url);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const json = await res.json();
        const raw = json?.data?.[0];
        if (!raw) {
          setAbout(null);
          setError("Data about tidak ditemukan.");
          return;
        }

        const attrs = raw?.attributes ?? raw ?? {};
        const imgUrl: string | undefined =
          attrs?.imageAbout?.data?.attributes?.url ??
          attrs?.imageAbout?.url ??
          (Array.isArray(attrs?.imageAbout)
            ? attrs?.imageAbout?.[0]?.url
            : undefined) ??
          undefined;

        setAbout({
          judulAbout: attrs?.judulAbout ?? attrs?.title ?? "",
          isiAbout: attrs?.isiAbout ?? attrs?.content ?? "",
          imageAbout: imgUrl ? { url: imgUrl } : undefined,
        });
      } catch (err: any) {
        console.error("Error fetching about:", err);
        setError(err?.message || "Gagal mengambil data about");
      } finally {
        setLoading(false);
      }
    }

    fetchAbout();
  }, [baseUrl]);

  const imageSrc = useMemo(() => {
    if (!about?.imageAbout?.url) return null;
    return about.imageAbout.url.startsWith("http")
      ? about.imageAbout.url
      : `${baseUrl}${about.imageAbout.url}`;
  }, [about, baseUrl]);

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-64 max-w-6xl flex flex-col">
        <h1
          className={`sm:text-7xl text-4xl tracking-tighter mb-4 text-[#546A51] ${montserrat.className}`}
        >
          ABOUT US
        </h1>

        {loading && <p>Sedang memuat data...</p>}

        {error && !loading && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-700">
            <div className="mb-2 font-bold">Error:</div>
            <div>{error}</div>
            <div className="mt-2 text-xs text-gray-700">
              Request URL: <span className="break-all">{requestUrl}</span>
            </div>
          </div>
        )}

        {!loading && !error && about && (
          <>
            {about.judulAbout && (
              <h2 className="text-2xl md:text-3xl mb-6 font-bold text-black">
                {about.judulAbout}
              </h2>
            )}

            {about.isiAbout && (
              <div className="prose prose-lg max-w-3xl mb-0 text-gray-700">
                <ReactMarkdown>{about.isiAbout}</ReactMarkdown>
              </div>
            )}

            {imageSrc && (
              <div className="w-full mt-8">
                <Image
                  src={imageSrc}
                  alt={about.judulAbout || "About image"}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                  priority
                />
              </div>
            )}

            {!about.judulAbout && !about.isiAbout && !imageSrc && (
              <p className="text-gray-600">Konten About belum tersedia.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
