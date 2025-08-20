"use client";

import localFont from "next/font/local";
import { useEffect, useMemo, useState } from "react";

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

interface Artwork {
  id: number;
  title: string;
  artist: string;
  description: string;
  image?: { url: string };
  collection?: { id: number; name: string } | null;
}

interface Collection {
  id: number;
  name: string;
  collapDescription?: string;
}

export default function ProjectPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "https://stunning-dream-45c19f9694.strapiapp.com/";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const collectionsUrl = `${baseUrl.replace(/\/+$/, "")}/api/collections`;
        const artworksUrl = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/artworks?populate[imageArtwork]=true&populate[collection]=true`;

        const [resCollections, resArtworks] = await Promise.all([
          fetch(collectionsUrl, { cache: "no-store" }),
          fetch(artworksUrl, { cache: "no-store" }),
        ]);

        if (!resCollections.ok) {
          throw new Error(
            `Collections ${
              resCollections.status
            }: ${await resCollections.text()}`
          );
        }
        if (!resArtworks.ok) {
          throw new Error(
            `Artworks ${resArtworks.status}: ${await resArtworks.text()}`
          );
        }

        const [collectionsData, artworksData] = await Promise.all([
          resCollections.json(),
          resArtworks.json(),
        ]);

        // Mapping Collections: mendukung struktur flat maupun attributes
        const formattedCollections: Collection[] = (
          collectionsData?.data ?? []
        ).map((item: any) => {
          const attrs = item?.attributes ?? item ?? {};
          return {
            id: item?.id,
            name: attrs?.name ?? "Untitled",
            // gunakan nama field yang benar dari Strapi (payload yang kamu kirim: collapDescription di root)
            collapDescription: attrs?.collapDescription ?? "",
          };
        });

        // Mapping Artworks: toleran pada struktur flat/attributes dan relasi collection
        const formattedArtworks: Artwork[] = (artworksData?.data ?? []).map(
          (item: any) => {
            const attrs = item?.attributes ?? item ?? {};

            const artistName: string =
              attrs?.artist ?? attrs?.Artist ?? "Unknown";

            // Coba beberapa kemungkinan lokasi URL gambar
            const imageUrl: string | undefined =
              attrs?.imageArtwork?.data?.attributes?.url ??
              attrs?.imageArtwork?.url ??
              (Array.isArray(attrs?.imageArtwork)
                ? attrs?.imageArtwork?.[0]?.url
                : undefined) ??
              undefined;

            // Relasi collection bisa berupa { data: { id, attributes } } (v4) atau langsung object flat
            const collectionRel =
              attrs?.collection?.data ?? attrs?.collection ?? null;

            const collectionId: number | undefined =
              (collectionRel?.id !== undefined
                ? Number(collectionRel.id)
                : undefined) ??
              (typeof collectionRel === "number" ? collectionRel : undefined);

            const collectionName: string | undefined =
              collectionRel?.attributes?.name ??
              collectionRel?.name ??
              undefined;

            return {
              id: item?.id,
              title: attrs?.title ?? "Untitled",
              artist: artistName,
              description:
                attrs?.description ??
                attrs?.Description ??
                attrs?.deskripsi ??
                "",
              image: imageUrl ? { url: imageUrl } : undefined,
              collection: collectionRel
                ? {
                    id: collectionId as number,
                    name: collectionName ?? "Untitled",
                  }
                : null,
            };
          }
        );

        setCollections(formattedCollections);
        setArtworks(formattedArtworks);

        // Set default selected collection jika ada
        if (formattedCollections.length > 0) {
          setSelectedCollection(formattedCollections[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [baseUrl]);

  const filteredArtworks = useMemo(() => {
    if (!selectedCollection) return artworks;
    return artworks.filter((art) => {
      const artColId =
        art.collection?.id !== undefined ? Number(art.collection?.id) : null;
      return artColId === selectedCollection;
    });
  }, [artworks, selectedCollection]);

  const selectedCollectionObj = useMemo(
    () => collections.find((col) => col.id === selectedCollection) || null,
    [collections, selectedCollection]
  );

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-64 max-w-8xl">
        <h2
          className={`sm:text-7xl text-4xl tracking-tighter mb-4 text-[#546A51] pb-12 ${montserrat.className}`}
        >
          Projects
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollection(col.id)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedCollection === col.id
                  ? "bg-[#546A51] text-white"
                  : "bg-white hover:bg-gray-300"
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>

        {/* Deskripsi koleksi terpilih (di antara tombol filter dan grid) */}
        {!loading && selectedCollectionObj?.collapDescription ? (
          <div className="mb-4 p-3 rounded border border-gray-700 bg-[#F6E2BFFF] text-gray-700">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedCollectionObj.collapDescription!,
              }}
            />
          </div>
        ) : null}

        {/* Loading State */}
        {loading && <p>Loading artworks...</p>}

        {/* No Data State */}
        {!loading && !error && filteredArtworks.length === 0 && (
          <p>No artworks found for this collection.</p>
        )}

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              className="border-none rounded p-4 shadow-xl bg-white cursor-pointer hover:ring-2 hover:ring-[#546A51] flex flex-col justify-start"
              onClick={() => {
                setSelectedArtwork(art);
                setModalOpen(true);
              }}
            >
              {art.image?.url && (
                <img
                  src={
                    art.image.url.startsWith("http")
                      ? art.image.url
                      : `${baseUrl}${art.image.url}`
                  }
                  alt={art.title}
                  className="w-full h-80 object-cover mb-4 rounded"
                  loading="lazy"
                />
              )}
              <h3 className="font-semibold text-center">{art.title}</h3>
              <p className="text-sm text-gray-600 text-center">{art.artist}</p>
              {art.collection && (
                <p className="text-xs text-gray-500 text-center">
                  Collection: {art.collection.name}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Modal Popup for Artwork Detail */}
        {modalOpen && selectedArtwork && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-40"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-700 hover:text-[#546A51] text-4xl font-bold z-50"
                style={{ lineHeight: 1 }}
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              {selectedArtwork.image?.url && (
                <div className="flex justify-center mb-4">
                  <img
                    src={
                      selectedArtwork.image.url.startsWith("http")
                        ? selectedArtwork.image.url
                        : `${baseUrl}${selectedArtwork.image.url}`
                    }
                    alt={selectedArtwork.title}
                    className="max-w-full max-h-[60vh] object-contain rounded"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold mb-2 text-center">
                {selectedArtwork.title}
              </h2>
              <p className="text-lg text-gray-700 mb-2 text-center">
                {selectedArtwork.artist}
              </p>
              {selectedArtwork.collection && (
                <p className="text-sm text-gray-500 mb-2 text-center">
                  Collection: {selectedArtwork.collection.name}
                </p>
              )}
              <div className="mt-4 text-gray-700">
                <h3 className="font-semibold mb-1">Deskripsi:</h3>
                {selectedArtwork.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedArtwork.description,
                    }}
                  />
                ) : (
                  <p className="italic text-gray-400">Tidak ada deskripsi.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
