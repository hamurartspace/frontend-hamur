import HeroSection from "./components/HeroSection";

export const metadata = {
  title: "Hamur Artspace - Home",
  description:
    "Hamur Artspace: Contemporary art gallery, exhibitions, programs, and artist residency in Malang.",
  keywords: [
    "art",
    "gallery",
    "exhibition",
    "program",
    "residency",
    "Malang",
    "Hamur Artspace",
  ],
  openGraph: {
    title: "Hamur Artspace - Home",
    description:
      "Hamur Artspace: Contemporary art gallery, exhibitions, programs, and artist residency in Malang.",
    url: "https://hamurartspace.com/",
    siteName: "Hamur Artspace",
    images: [
      {
        url: "/public/AboutPage.jpg",
        width: 1200,
        height: 630,
        alt: "Hamur Artspace Gallery",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen text-white">
      <HeroSection />
    </div>
  );
}
