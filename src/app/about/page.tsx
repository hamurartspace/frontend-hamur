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
  moto: string;
  isiAbout: string;
  mediaImage?: { url: string; alternativeText?: string };
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL || "https://backend-hamur.onrender.com";

  const [requestUrl, setRequestUrl] = useState("");
  useEffect(() => {
    async function fetchAbout() {
      try {
        setLoading(true);
        setError(null);

        const url = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/about-pages?populate=mediaImage`;
        setRequestUrl(url);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const json = await res.json();
        const raw = json?.data?.[0];
        const attrs = raw?.attributes ?? raw ?? {};
        const imgData =
          attrs?.mediaImage?.data?.attributes ?? attrs?.mediaImage;
        const imgUrl: string | undefined = imgData?.url;
        const altText: string | undefined = imgData?.alternativeText ?? "";

        setAbout({
          moto: attrs?.moto ?? "",
          isiAbout: attrs?.isiAbout ?? "",
          mediaImage: imgUrl
            ? { url: imgUrl, alternativeText: altText }
            : undefined,
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
    if (!about?.mediaImage?.url) return null;
    return about.mediaImage.url.startsWith("http")
      ? about.mediaImage.url
      : `${baseUrl}${about.mediaImage.url}`;
  }, [about, baseUrl]);

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-64 max-w-6xl flex flex-col">
        <h1
          className={`sm:text-7xl text-4xl tracking-tighter mb-4 text-[#546A51] ${montserrat.className}`}
        >
          About Us
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
            {about.moto && (
              <h2 className="text-2xl md:text-3xl mb-6 font-bold text-black">
                {about.moto}
              </h2>
            )}

            {about.isiAbout && (
              <div className="prose prose-lg max-w-3xl mb-0 text-gray-700">
                <ReactMarkdown>{about.isiAbout}</ReactMarkdown>
              </div>
            )}

            {imageSrc && (
              <div className="w-full mt-8 flex">
                <Image
                  src={imageSrc}
                  alt={
                    about.mediaImage?.alternativeText ||
                    about.moto ||
                    "About image"
                  }
                  width={400} // atur lebih kecil dari original (misalnya 600px)
                  height={0} // auto, karena kita tambahkan style
                  style={{ height: "auto" }}
                  className="rounded-lg shadow-lg"
                  priority
                />
              </div>
            )}

            {!about.moto && !about.isiAbout && !imageSrc && (
              <p className="text-gray-600">Konten About belum tersedia.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
