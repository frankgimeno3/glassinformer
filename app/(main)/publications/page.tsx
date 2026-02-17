"use client";

import { FC, useState, useMemo, useEffect } from "react";
import PublicationFilter, {
  type PublicationFilterState,
} from "./publicationComponents/PublicationFilter";
import PublicationCard, {
  type Publication,
} from "./publicationComponents/PublicationCard";
import { PublicationService } from "@/apiClient/PublicationService";

interface PublicationsProps {}

const ITEMS_PER_PAGE = 24;
const DEFAULT_FILTER: PublicationFilterState = {
  number: "",
  month: "",
  year: "",
  dateFrom: "",
  dateTo: "",
};

function normalizePublication(raw: any): Publication | null {
  if (!raw) return null;
  const num =
    raw.number ??
    raw.number_publication ??
    raw.número;
  const numValue = num !== undefined && num !== null ? Number(num) : NaN;
  const publicationDate =
    raw.date ?? raw.publicationDate ?? raw.publication_date ?? "";
  if (!publicationDate && !raw.redirectionLink) return null;
  const dateForYear = publicationDate ? new Date(publicationDate) : new Date();
  return {
    id: raw.id_publication ?? undefined,
    number: Number.isNaN(numValue) ? 0 : numValue,
    title: raw.revista ?? raw.title ?? "",
    description: raw.description ?? "",
    redirection_link: raw.redirection_link ?? raw.redirectionLink ?? "",
    year: dateForYear.getFullYear(),
    publicationDate,
    publicationMainImageUrl: raw.publication_main_image_url ?? "",
  };
}

const Publications: FC<PublicationsProps> = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<PublicationFilterState>(DEFAULT_FILTER);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const data = await PublicationService.getAllPublications();
        const list = Array.isArray(data) ? data : [];
        const valid = list
          .map(normalizePublication)
          .filter((p): p is Publication => p !== null);
        setPublications(valid);
      } catch (error) {
        console.error("Error fetching publications:", error);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  const typedData = publications;

  const availableNumbers = useMemo(() => {
    const nums = [...new Set(typedData.map((p) => p.number))].sort((a, b) => b - a);
    return nums;
  }, [typedData]);

  const availableYears = useMemo(() => {
    const years = [...new Set(typedData.map((p) => p.year))].sort((a, b) => b - a);
    return years;
  }, [typedData]);

  const filteredPublications = useMemo(() => {
    let list = typedData;

    if (filter.number) {
      const num = Number(filter.number);
      list = list.filter((p) => p.number === num);
    }
    if (filter.month) {
      const month = Number(filter.month);
      list = list.filter((p) => {
        const d = new Date(p.publicationDate);
        return d.getMonth() + 1 === month;
      });
    }
    if (filter.year) {
      const year = Number(filter.year);
      list = list.filter((p) => p.year === year);
    }
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom);
      list = list.filter((p) => new Date(p.publicationDate) >= from);
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((p) => new Date(p.publicationDate) <= to);
    }

    return list.sort((a, b) => {
      const da = new Date(a.publicationDate).getTime();
      const db = new Date(b.publicationDate).getTime();
      return db - da;
    });
  }, [typedData, filter]);

  const groupedPublications = useMemo(() => {
    const grouped: { [year: number]: Publication[] } = {};
    filteredPublications.forEach((pub) => {
      if (!grouped[pub.year]) grouped[pub.year] = [];
      grouped[pub.year].push(pub);
    });
    const sortedYears = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);
    const flatList: (Publication | { type: 'separator'; year: number })[] = [];
    sortedYears.forEach((year) => {
      flatList.push({ type: 'separator', year } as Publication & { type: 'separator'; year: number });
      grouped[year].forEach((pub) => flatList.push(pub));
    });
    return flatList;
  }, [filteredPublications]);

  const { totalPages, currentPublications } = useMemo(() => {
    const total = Math.max(1, Math.ceil(groupedPublications.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const current = groupedPublications.slice(startIndex, endIndex);
    return { totalPages: total, currentPublications: current };
  }, [groupedPublications, currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center text-4xl sm:text-5xl font-bold text-gray-900 pb-6 sm:pb-8">
        Publications
      </h1>

      <PublicationFilter
        filter={filter}
        onFilterChange={(f) => {
          setFilter(f);
          setCurrentPage(1);
        }}
        availableNumbers={availableNumbers}
        availableYears={availableYears}
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading publications...</p>
        </div>
      ) : filteredPublications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 w-full">
          <p className="text-gray-500 text-lg">No publications found</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto justify-items-center">
        {currentPublications.map((item, index) => {
          if ("type" in item && item.type === "separator") {
            return (
              <div
                key={`separator-${item.year}-${index}`}
                className="col-span-full text-center my-6"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 border-b-2 border-gray-300 pb-4 inline-block px-8">
                  {item.year}
                </h2>
              </div>
            );
          }
          const publication = item as Publication;
          return (
            <div
              key={publication.id ?? `pub-${index}`}
              className="w-full flex justify-center min-w-0"
            >
              <PublicationCard publication={publication} />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8 pb-8">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentPage === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentPage === totalPages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
      </>
      )}
    </div>
  );
};

export default Publications;
