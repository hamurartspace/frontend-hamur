"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";

const montserrat = localFont({
  src: "../../../public/fonts/Montserrat-Regular.woff2",
});

interface Course {
  id: number;
  title: string;
  slug: string;
  schedule: string;
  image?: {
    url: string;
  };
}

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
        if (!baseUrl) throw new Error("NEXT_PUBLIC_STRAPI_URL belum diset");

        const url = `${baseUrl.replace(/\/+$/, "")}/api/courses?populate=image`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        const data = await res.json();
        const formatted: Course[] = (data?.data ?? []).map((item: any) => {
          // Fallback jika item.attributes tidak ada
          const attr = item?.attributes ?? item;
          return {
            id: item?.id ?? attr?.id,
            title: attr?.tittle ?? "Untitled",
            slug: attr?.slug ?? "",
            schedule: attr?.schedule ?? "",
            image: attr?.image?.data?.attributes?.url
              ? { url: attr.image.data.attributes.url }
              : undefined,
          };
        });

        setCourses(formatted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-81 max-w-8xl">
        <h1
          className={`sm:text-7xl text-4xl mb-6 ${montserrat.className} tracking-tighter text-[#546A51]`}
        >
          Courses
        </h1>

        {/* State */}
        {loading && <p>Memuat data...</p>}
        {error && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6">
            {courses.length === 0 ? (
              <p>Tidak ada courses.</p>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="border-none rounded-lg overflow-hidden shadow-xl bg-white text-black hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => router.push(`/courses/${course.slug}`)}
                >
                  {course.image ? (
                    <Image
                      src={course.image.url}
                      alt={course.title}
                      width={800}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-2">
                      {course.title}
                    </h2>
                    <p className="text-black">{course.schedule}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
