import Link from "next/link";
import localFont from "next/font/local";
import Image from "next/image";

const fiveyearsold = localFont({
  src: "../../../public/fonts/5yearsoldfont.woff2",
});

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

export default function HeroSection() {
  return (
    <main className="flex-1 flex bg-[#F6E2BFFF] md:mr-64 min-h-screen">
      {/* Gambar kiri */}
      <div className="hidden md:block md:w-1/3 relative">
        <Image
          src="/pic5.jpg"
          alt="Gambar"
          className="w-full h-[100vh] object-cover opacity-100"
          fill
        />
      </div>

      {/* Bagian teks kanan */}
      <div className="w-full md:w-2/3 flex flex-col justify-center p-6 md:p-12 text-left md:text-right bg-[#F6E2BFFF]">
        <q
          className={`text-7xl font-bold leading-tight mb-3 text-[#546A51] sm:pt-0 pt-24 italic ${fiveyearsold.className}`}
        >
          An Empty Canvas Is Full
        </q>
        <p
          className={`text-xl md:text-2xl mb-4 text-black ${montserrat.className}`}
        >
          - Robert Rauschenberg
        </p>
        <Link
          href="/project"
          className="bg-[#546A51] hover:bg-[#303d2f] px-6 py-3 rounded font-semibold text-white text-center"
        >
          SEE OUR PROJECTS
        </Link>
      </div>
    </main>
  );
}
