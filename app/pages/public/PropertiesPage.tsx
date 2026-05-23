import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Heart, Bed, Bath, Maximize, MapPin, Search as SearchIcon, SlidersHorizontal, Eye, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../../contexts/AppContext";
import { getProperties, Property, formatEGPShort, PropertiesResponse } from "../../../services/api";

const TYPES = [
  { value: "any", keyEn: "Any", keyAr: "الكل" },
  { value: "apartment", keyEn: "Apartment", keyAr: "شقة" },
  { value: "villa", keyEn: "Villa", keyAr: "فيلا" },
  { value: "house", keyEn: "House", keyAr: "منزل" },
  { value: "land", keyEn: "Land", keyAr: "أرض" },
  { value: "commercial", keyEn: "Commercial", keyAr: "تجاري" },
];

export const PropertiesPage: React.FC = () => {
  const { t, language, isRtl } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const itemsPerPage = 9;

  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [type, setType] = useState<string>("any");
  const [rooms, setRooms] = useState<number | "any">("any");
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedProperties") || "[]");
    setSavedProperties(saved);
  }, []);

  const toggleSaveProperty = (propId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("savedProperties") || "[]");
    let newSaved;
    if (saved.includes(propId)) {
      newSaved = saved.filter((id: string) => id !== propId);
    } else {
      newSaved = [...saved, propId];
    }
    localStorage.setItem("savedProperties", JSON.stringify(newSaved));
    setSavedProperties(newSaved);
  };

  const fetchProperties = async (page: number) => {
    setLoading(true);
    try {
      const data: PropertiesResponse = await getProperties(page, itemsPerPage);
      setProperties(data.properties);
      setTotalPages(data.totalPages);
      setTotalProperties(data.totalProperties);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(currentPage); }, [currentPage]);

  const results = useMemo(() => {
    return properties.filter((p) => {
      if (type !== "any" && p.type !== type) return false;
      const min = minPriceInput === "" ? 0 : Number(minPriceInput);
      const max = maxPriceInput === "" ? Infinity : Number(maxPriceInput);
      if (p.price < min || p.price > max) return false;
      if (rooms !== "any" && p.bedrooms < rooms) return false;
      const loc = language === 'en' ? p.location : p.locationAr;
      if (location && loc && !loc.toLowerCase().includes(location.toLowerCase())) return false;
      const title = language === 'en' ? p.title : p.titleAr;
      if (query && title && loc && !`${title} ${loc}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [properties, minPriceInput, maxPriceInput, type, rooms, location, query, language]);

  const reset = () => { setMinPriceInput(""); setMaxPriceInput(""); setType("any"); setRooms("any"); setLocation(""); setQuery(""); };
  const locations = Array.from(new Set(properties.map((p) => language === 'en' ? p.location : p.locationAr).filter(Boolean)));

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mx-auto mt-6 mb-24 max-w-7xl px-4 w-full">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)] mb-1">{language === 'en' ? 'Explore' : 'استكشف'}</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-[var(--foreground)]">{language === 'en' ? 'Find your next home' : 'ابحث عن منزلك القادم'}</h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{language === 'en' ? 'Browse curated listings across the city' : 'تصفح القوائم المنسقة عبر المدينة'}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex lg:hidden items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] shadow-sm shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {language === 'en' ? 'Filters' : 'تصفية'}
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all">
            <SearchIcon className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === 'en' ? "Search location, city or area..." : "البحث عن موقع، مدينة أو منطقة..."} className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)] text-[var(--foreground)]" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters — always visible on lg+, toggleable on mobile */}
        <motion.aside
          initial={{ x: isRtl ? 30 : -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${
            showMobileFilters ? 'block' : 'hidden'
          } lg:block h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
              <SlidersHorizontal className="h-4 w-4" /> {language === 'en' ? 'Filters' : 'عوامل التصفية'}
            </div>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--secondary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 space-y-5">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Price range' : 'نطاق السعر'}</label>
              <div className="flex items-center gap-2">
                <input type="number" value={minPriceInput} onChange={e => setMinPriceInput(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] dark:bg-[var(--input)] px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]" placeholder={language === 'en' ? "Min" : "الأقل"} />
                <span className="text-[var(--text-secondary)]">-</span>
                <input type="number" value={maxPriceInput} onChange={e => setMaxPriceInput(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] dark:bg-[var(--input)] px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]" placeholder={language === 'en' ? "Max" : "الأقصى"} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Location' : 'الموقع'}</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] dark:bg-[var(--input)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] appearance-none">
                <option value="">{language === 'en' ? 'Any' : 'الكل'}</option>
                {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Property type' : 'نوع العقار'}</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TYPES.map((opt) => (
                  <button key={opt.value} onClick={() => setType(opt.value)} className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-all ${type === opt.value ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"}`}>
                    {language === 'en' ? opt.keyEn : opt.keyAr}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Rooms' : 'الغرف'}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["any", 1, 2, 3, 4, 5] as const).map((r) => (
                  <button key={r} onClick={() => setRooms(r)} className={`min-w-[40px] rounded-xl border px-3 py-2 text-xs font-medium transition-all ${rooms === r ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"}`}>
                    {r === "any" ? (language === 'en' ? 'Any' : 'الكل') : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={reset} className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--foreground)]">{language === 'en' ? 'Reset' : 'إعادة تعيين'}</button>
            </div>
          </div>
        </motion.aside>

        {/* Listings */}
        <div>
          <p className="mb-4 text-sm text-[var(--text-secondary)] font-medium">{loading ? '...' : `${totalProperties} ${language === 'en' ? 'properties found' : 'عقار'}`}</p>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  <div className="h-48 skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 skeleton w-3/4 rounded-lg" />
                    <div className="h-4 skeleton w-1/2 rounded-lg" />
                    <div className="h-8 skeleton rounded-lg mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="w-8 h-8 text-[var(--text-secondary)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{language === 'en' ? 'No properties found' : 'لم يتم العثور على عقارات'}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{language === 'en' ? 'Try adjusting your filters.' : 'حاول تعديل عوامل التصفية.'}</p>
              <button onClick={reset} className="mt-4 px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold">{language === 'en' ? 'Reset Filters' : 'إعادة تعيين'}</button>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <motion.article variants={itemVariants} whileHover={{ y: -4 }} key={p.id || p._id} className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow hover:shadow-xl">
                  <div className="relative overflow-hidden">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'} alt={p.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                    {p.featured && (
                      <span className="absolute start-3 top-3 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm">{language === 'en' ? 'HOT DEAL' : 'عرض مميز'}</span>
                    )}
                    <button
                      onClick={(e) => toggleSaveProperty(p.id || p._id || '', e)}
                      className="absolute end-3 top-3 z-10 p-2 rounded-full bg-[var(--card)]/80 hover:bg-[var(--card)] text-[var(--text-secondary)] hover:text-red-500 backdrop-blur shadow-md transition-all active:scale-95"
                      aria-label="Save Property"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          savedProperties.includes(p.id || p._id || '')
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </button>
                    <Link to={`/properties/${p.id || p._id}`} className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)]/90 px-3 py-2.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                      <Eye className="h-3.5 w-3.5" /> {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                    </Link>
                  </div>
                  <div className="p-4 flex flex-col h-[160px]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-[var(--primary)]">{formatEGPShort(p.price)}</span>
                      {p.status === 'rented' && <span className="text-xs text-[var(--text-secondary)]">/ {language === 'en' ? 'Month' : 'شهر'}</span>}
                    </div>
                    <Link to={`/properties/${p.id || p._id}`} className="mt-1 block font-bold text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-1 text-sm transition-colors">{language === 'en' ? p.title : p.titleAr}</Link>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-secondary)] line-clamp-1"><MapPin className="h-3 w-3 shrink-0" /> {language === 'en' ? p.location : p.locationAr}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)] font-medium">
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-[var(--primary)]" /> {p.bedrooms} {language === 'en' ? 'bd' : 'غرف'}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-[var(--primary)]" /> {p.bathrooms} {language === 'en' ? 'bt' : 'حمامات'}</span>
                      <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-[var(--primary)]" /> {p.size} m²</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          {/* Real Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) { pageNum = i + 1; }
                else if (currentPage <= 3) { pageNum = i + 1; }
                else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                else { pageNum = currentPage - 2 + i; }
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold transition-all ${currentPage === pageNum ? "bg-[var(--primary)] text-white shadow-md" : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--secondary)]"}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
