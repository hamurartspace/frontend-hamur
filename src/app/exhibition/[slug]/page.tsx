"use client";

import BackButton from "@/app/components/BackButton";
import React, { useEffect, useState } from "react";

// Modal component
function ArtworkModal({
  artwork,
  onClose,
  baseUrl,
}: {
  artwork: any;
  onClose: () => void;
  baseUrl: string;
}) {
  if (!artwork) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-[92vw] max-w-lg md:max-w-2xl lg:max-w-3xl p-4 md:p-8 relative max-h-[85vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-[#546A51] text-3xl font-bold z-50"
          style={{ lineHeight: 1 }}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {artwork.image?.url && (
          <div className="flex justify-center items-center mb-6 w-full">
            <img
              src={
                artwork.image.url.startsWith("http")
                  ? artwork.image.url
                  : `${baseUrl}${artwork.image.url}`
              }
              alt={artwork.title}
              className="w-full max-h-[60vh] object-contain rounded-lg"
            />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-2 text-center">{artwork.title}</h2>
        <p className="text-lg text-[#546A51] mb-2 text-center">
          {artwork.artistName}
        </p>
        <div className="mt-4 text-gray-700">
          <h3 className="font-semibold mb-1">Description:</h3>
          {artwork.description ? (
            <p>{artwork.description}</p>
          ) : (
            <p className="italic text-gray-400">Tidak ada deskripsi.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? "";

  const [exhibition, setExhibition] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const url = `${baseUrl}/api/collection-exhibitions?filters[slug][$eq]=${slug}&populate=artwork_exhibitions.image`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      console.log("API Response:", data);
      const item = data?.data?.[0];
      if (!item) return;
      setExhibition(item);
      setArtworks(item.artwork_exhibitions ?? []);
    }
    fetchData();
  }, [slug, baseUrl]);

  if (!exhibition)
    return (
      <section className="bg-[#F6E2BFFF] min-h-screen flex items-center justify-center">
        <div className="text-black text-xl">Exhibition tidak ditemukan</div>
      </section>
    );

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-81 max-w-9xl flex flex-col">
        {/* Title & Description */}
        <h2 className="sm:text-5xl text-3xl tracking-wide mb-4 text-[#546A51] pb-4 font-bold">
          {exhibition.title}
        </h2>
        <div className="mb-4">
          <BackButton />
        </div>
        <p className="mb-8 text-black whitespace-pre-line">
          {exhibition.description}
        </p>
        {/* Grid Artwork */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.length === 0 && (
            <div className="col-span-full text-black text-lg">
              Tidak ada karya pada pameran ini.
            </div>
          )}
          {artworks.map((art: any) => (
            <div
              key={art.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-4 flex flex-col h-[360px]" // fixed height
              onClick={() => setSelectedArtwork(art)}
            >
              <img
                src={art.image?.url}
                alt={art.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold mb-1 text-black line-clamp-2">
                {art.title}
              </h3>
              <p className="text-black line-clamp-1">{art.artistName}</p>
              <div className="mt-auto" />{" "}
              {/* supaya title/artist tetap di atas, ada space kosong di bawah */}
            </div>
          ))}
        </div>

        {/* Modal */}
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          baseUrl={baseUrl}
        />
      </div>
    </section>
  );
}
