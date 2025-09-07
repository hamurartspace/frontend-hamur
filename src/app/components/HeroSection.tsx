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
    <main className="flex-1 flex md:mr-81 min-h-screen relative">
      {/* Background image layer */}
      <div className="absolute inset-0 h-full min-h-screen bg-[url('/pic5.jpg')] bg-cover bg-center z-0" />

      {/* Blur overlay */}
      <div className="absolute inset-0 h-full min-h-screen bg-black/30 backdrop-blur-md z-10" />
      {/* Bagian teks kanan */}
      <div className="w-full md:w-full flex flex-col justify-center p-6 md:p-12 text-left md:text-right relative z-20">
        <q
          className={`text-6xl md:text-[110px] font-bold leading-tight mb-3 text-[#ffffff] sm:pt-0 pt-24 italic ${fiveyearsold.className}`}
        >
          An Empty Canvas Is Full
        </q>
        <p
          className={`text-xl md:text-2xl mb-4 text-white ${montserrat.className}`}
        >
          - Robert Rauschenberg
        </p>
        <Link
          href="/exhibition"
          className="bg-[#000000] hover:bg-[#303d2f] px-6 py-3 rounded font-semibold text-white w-fit mx-auto md:mx-0 self-end mt-8"
        >
          SEE OUR EXHIBITIONS
        </Link>
      </div>
    </main>
  );
}
