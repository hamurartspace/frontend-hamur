import Image from "next/image";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import BackButton from "@/app/components/BackButton";

const montserrat = localFont({
  src: "../../../../public/fonts/Montserrat-Regular.woff2",
});

interface CourseDetail {
  title: string;
  description: string;
  schedule: string;
  image?: {
    url: string;
  };
  registrationLink?: string;
}

function isRegistrationClosed(schedule: string) {
  const dateStr = schedule.split(" ")[0];
  const scheduleDate = new Date(dateStr);
  const today = new Date();
  scheduleDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return today >= scheduleDate;
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_STRAPI_URL belum diset");

  const url = `${baseUrl.replace(/\/+$/, "")}/api/courses?filters[slug][$eq]=${
    params.slug
  }&populate=image`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Gagal fetch course: ${res.status}`);

  const data = await res.json();
  const item = data?.data?.[0];
  if (!item) return notFound();

  const attr = item?.attributes ?? item;

  const course: CourseDetail = {
    title: attr.tittle ?? "Untitled",
    description: attr.description ?? "",
    schedule: attr.schedule ?? "",
    image: attr.image?.data?.attributes?.url
      ? { url: attr.image.data.attributes.url }
      : undefined,
    registrationLink: attr.registrationLink ?? "",
  };

  const registrationClosed = isRegistrationClosed(course.schedule);

  return (
    <section className="bg-[#F6E2BFFF] min-h-screen">
      <div className="p-8 md:pl-16 md:mr-81 max-w-9xl flex flex-col">
        <h1
          className={`sm:text-7xl text-4xl tracking-tighter mb-4 text-[#546A51] ${montserrat.className}`}
        >
          {course.title}
        </h1>

        <div className="rounded-xl shadow-xl bg-[#fcf1dc] overflow-hidden">
          {course.image && (
            <Image
              src={course.image.url}
              alt={course.title}
              width={1000}
              height={500}
              className="w-full h-80 object-cover"
            />
          )}

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#546A51] mb-2">
                Jadwal
              </h2>
              <p className="text-gray-700">{course.schedule}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#546A51] mb-2">
                Deskripsi
              </h2>
              <p className="text-gray-800 whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {course.registrationLink && (
              <a
                href={registrationClosed ? undefined : course.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block px-8 py-3 rounded-lg text-lg font-semibold transition ${
                  registrationClosed
                    ? "bg-gray-400 text-white cursor-not-allowed pointer-events-none"
                    : "bg-[#546A51] text-white hover:bg-[#3e4f3d]"
                }`}
                aria-disabled={registrationClosed}
                tabIndex={registrationClosed ? -1 : 0}
              >
                {registrationClosed ? "Pendaftaran Ditutup" : "Daftar Sekarang"}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="md:ml-16 ml-8">
        <BackButton />
      </div>
    </section>
  );
}
