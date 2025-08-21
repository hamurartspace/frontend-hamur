"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaInstagramSquare,
  FaYoutube,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import localFont from "next/font/local";
import styled from "styled-components";

const rivanna = localFont({
  src: "../../../public/fonts/RivannaNF.woff2",
});

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "HOME", path: "/" },
    { name: "ABOUT US", path: "/about" },
    { name: "EXHIBITION", path: "/exhibition" },
    { name: "PROGRAM", path: "/program" },
    { name: "PROJECT", path: "/project" },
    { name: "ARCHIVE", path: "/archive" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <aside className="hidden md:flex w-64 h-screen bg-[#F6E2BFFF] flex-col justify-between p-6 border-l border-[#546A51]/70 fixed right-0 top-0 z-50">
        <div>
          {/* Logo */}
          <div className="leading-tight mb-48">
            <Link href="/">
              <span
                className={` text-center text-8xl text-[#546A51] ${rivanna.className}`}
              >
                HAMUR
              </span>
              <br />{" "}
              <span
                className={` text-center text-[44px] text-black ${montserrat.className}`}
              >
                art space
              </span>
            </Link>
          </div>
          {/* Menu */}
          <nav
            className={`space-y-3 text-2xl text-black ${montserrat.className}`}
          >
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="block hover:text-[#546A51]"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        {/* Footer */}
        <div className="space-y-4 text-black">
          <div className="flex space-x-3 text-xl">
            <Link
              href="https://www.instagram.com/hamurartspace/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </Link>
          </div>
          <div className={`text-sm ${montserrat.className}`}>
            <h2>Jl. Cisadane No.11A, Malang</h2>
          </div>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-8 right-4 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#F6E2BFFF] p-2 rounded text-[#546A51]"
          >
            <FiMenu size={24} />
          </button>
        ) : (
          <div className="fixed inset-0 top-4 bg-[#F6E2BFFF] flex flex-col justify-between p-6 z-50">
            {/* Close Button */}
            <div className="flex justify-end"></div>

            {/* Logo & Menu */}
            <div>
              <div className="leading-tight mb-8 text-center">
                <Link href="/" className={``} onClick={() => setIsOpen(false)}>
                  <span
                    className={` text-center text-8xl text-[#546A51] ${rivanna.className}`}
                  >
                    HAMUR
                  </span>
                  <br />{" "}
                  <span
                    className={` text-center text-[44px] text-black ${montserrat.className}`}
                  >
                    art space
                  </span>
                </Link>
              </div>
              <nav className="space-y-6 text-center text-2xl text-black">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="block hover:text-[#546A51]"
                    onClick={() => setIsOpen(false)} // tutup setelah klik
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="space-y-4 text-center pt-8">
              <div className="flex justify-center space-x-4 text-xl text-[#546A51]">
                <Link
                  href="https://www.instagram.com/hamurartspace/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram />
                </Link>
              </div>
              <div className="text-sm text-[#546A51]">
                <h2>Jl. Cisadane No.11A, Malang</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
