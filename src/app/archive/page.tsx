"use client";

import localFont from "next/font/local";
import { useEffect, useMemo, useState } from "react";

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

interface ArtworkArchive {
  id: number;
  titleArchive: string;
  artistArchive: string;
  descriptionArchive: string;
  imageArchive?: { url: string };
  collection_archive?: { id: number; nameArchive: string } | null;
}

interface CollectionArchive {
  id: number;
  nameArchive: string;
}

export default function ArchivePage() {
  const [collections, setCollections] = useState<CollectionArchive[]>([]);
  const [artworks, setArtworks] = useState<ArtworkArchive[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkArchive | null>(
    null
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "https://stunning-dream-45c19f9694.strapiapp.com/";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const collectionsUrl = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/collection-archives`;
        const artworksUrl = `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/artwork-archives?populate=imageArchive&populate=collection_archive`;

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

        const formattedCollections: CollectionArchive[] = (
          collectionsData?.data ?? []
        ).map((item: any) => {
          const attrs = item?.attributes ?? item ?? {};
          return {
            id: item?.id,
            nameArchive: attrs?.nameArchive ?? "Untitled",
          };
        });

        const formattedArtworks: ArtworkArchive[] = (
          artworksData?.data ?? []
        ).map((item: any) => {
          const attrs = item?.attributes ?? item ?? {};
          // Pilih WebP jika tersedia, fallback ke JPG
          let imageUrl: string | undefined = undefined;
          const imgObj =
            attrs?.imageArchive?.data?.attributes ?? attrs?.imageArchive ?? {};
          if (imgObj?.formats?.webp?.url) {
            imageUrl = imgObj.formats.webp.url;
          } else if (imgObj?.url) {
            imageUrl = imgObj.url;
          } else if (
            Array.isArray(attrs?.imageArchive) &&
            attrs?.imageArchive?.[0]?.url
          ) {
            imageUrl = attrs?.imageArchive?.[0]?.url;
          }
          const collectionRel =
            attrs?.collection_archive?.data ??
            attrs?.collection_archive ??
            null;
          const collectionId: number | undefined =
            (collectionRel?.id !== undefined
              ? Number(collectionRel.id)
              : undefined) ??
            (typeof collectionRel === "number" ? collectionRel : undefined);
          const collectionName: string | undefined =
            collectionRel?.attributes?.nameArchive ??
            collectionRel?.nameArchive ??
            undefined;
          return {
            id: item?.id,
            titleArchive: attrs?.titleArchive ?? "Untitled",
            artistArchive: attrs?.artistArchive ?? "Unknown",
            descriptionArchive: attrs?.descriptionArchive ?? "",
            imageArchive: imageUrl ? { url: imageUrl } : undefined,
            collection_archive: collectionRel
              ? {
                  id: collectionId as number,
                  nameArchive: collectionName ?? "Untitled",
                }
              : null,
          };
        });

        setCollections(formattedCollections);
        setArtworks(formattedArtworks);
        if (formattedCollections.length > 0) {
          setSelectedCollection(formattedCollections[0].id);
        }
      } catch (err: any) {
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
        art.collection_archive?.id !== undefined
          ? Number(art.collection_archive?.id)
          : null;
      return artColId === selectedCollection;
    });
  }, [artworks, selectedCollection]);

  const selectedCollectionObj = useMemo(
    () => collections.find((col) => col.id === selectedCollection) || null,
    [collections, selectedCollection]
  );

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 max-w-8xl">
        <h2
          className={`sm:text-7xl text-4xl tracking-tighter mb-4 text-[#546A51] pb-12 ${montserrat.className}`}
        >
          Archive
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
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {col.nameArchive}
            </button>
          ))}
        </div>
        {/* Loading State */}
        {loading && <p>Loading artworks...</p>}
        {/* No Data State */}
        {!loading && !error && filteredArtworks.length === 0 && (
          <p>No artworks found for this collection.</p>
        )}
        {/* Artworks Grid */}
        <div className="w-full md:pr-64 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              className="border-none rounded p-4 shadow-xl bg-white cursor-pointer hover:ring-2 hover:ring-[#546A51] flex flex-col justify-between"
              onClick={() => {
                setSelectedArtwork(art);
                setModalOpen(true);
              }}
            >
              {art.imageArchive?.url && (
                <img
                  src={
                    art.imageArchive.url.startsWith("http")
                      ? art.imageArchive.url
                      : `${baseUrl}${art.imageArchive.url}`
                  }
                  alt={art.titleArchive}
                  className="w-full h-64 object-cover mb-4 rounded"
                  loading="lazy"
                />
              )}
              <h3 className="font-semibold text-center">{art.titleArchive}</h3>
              <p className="text-sm text-gray-600 text-center">
                {art.artistArchive}
              </p>
              {art.collection_archive && (
                <p className="text-xs text-gray-500 text-center">
                  Collection: {art.collection_archive.nameArchive}
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
              {selectedArtwork.imageArchive?.url && (
                <div className="flex justify-center mb-4">
                  <img
                    src={
                      selectedArtwork.imageArchive.url.startsWith("http")
                        ? selectedArtwork.imageArchive.url
                        : `${baseUrl}${selectedArtwork.imageArchive.url}`
                    }
                    alt={selectedArtwork.titleArchive}
                    className="max-w-full max-h-[60vh] object-contain rounded"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold mb-2 text-center">
                {selectedArtwork.titleArchive}
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                {selectedArtwork.artistArchive}
              </p>
              {selectedArtwork.collection_archive && (
                <p className="text-sm text-gray-500 mb-2">
                  Collection: {selectedArtwork.collection_archive.nameArchive}
                </p>
              )}
              <div className="mt-4 text-gray-700">
                <h3 className="font-semibold mb-1">Deskripsi:</h3>
                {selectedArtwork.descriptionArchive ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedArtwork.descriptionArchive,
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
