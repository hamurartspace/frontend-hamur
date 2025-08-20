import localFont from "next/font/local";
import { useState } from "react";

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

export default function ContactPage() {
  return (
    <main className="flex min-h-screen bg-[#F6E2BFFF] md:mr-64 max-w-8xl">
      <div className="w-full flex flex-col md:flex-row p-8 md:pb-4 md:pl-16">
        {/* Info Kontak di kiri */}
        <div className="md:w-1/2 md:pr-12 flex flex-col justify-start">
          <h1
            className={`${montserrat.className} tracking-tighter sm:text-7xl text-4xl md:text-7xl text-[#546A51] pb-32`}
          >
            CONTACT US
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#546A51]">
            GET IN TOUCH WITH HAMUR ARTSPACE
          </h2>
          <p className="text-gray-700 mb-8">
            Hamur Art Space is here to connect! Whether you're an artist seeking
            representation, an art enthusiast with questions, or simply curious
            about our upcoming exhibitions, we'd love to hear from you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <div>
              <h3 className="font-semibold text-[#546A51]">📧 Email</h3>
              <p className="text-gray-700">hamurartspace@gmail.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#546A51]">
                🏛️ Hamur Art Space Address
              </h3>
              <p className="text-gray-700">Jl. Cisadane No.11A, Malang</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
