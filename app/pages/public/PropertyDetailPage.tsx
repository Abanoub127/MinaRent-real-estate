import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Heart, Bed, Bath, Maximize, MapPin, Phone, MessageCircle, Star, Calendar, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../contexts/AppContext";
import { getPropertyById, Property, formatEGPShort, getTestimonials } from "../../../services/api";

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language, isRtl } = useApp();
  const [active, setActive] = useState(0);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingInfo, setRatingInfo] = useState({ rating: 4.9, count: 120 });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // Check if property is saved in localStorage
    const saved = JSON.parse(localStorage.getItem("savedProperties") || "[]");
    setIsSaved(saved.includes(id));

    Promise.all([getPropertyById(id), getTestimonials()])
      .then(([propertyData, testimonialsList]) => {
        setProperty(propertyData);
        if (testimonialsList && testimonialsList.length > 0) {
          const totalRating = testimonialsList.reduce((acc, t) => acc + t.rating, 0);
          const avg = Number((totalRating / testimonialsList.length).toFixed(1));
          setRatingInfo({ rating: avg, count: testimonialsList.length });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const toggleSave = () => {
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem("savedProperties") || "[]");
    let newSaved;
    if (saved.includes(id)) {
      newSaved = saved.filter((savedId: string) => savedId !== id);
      setIsSaved(false);
    } else {
      newSaved = [...saved, id];
      setIsSaved(true);
    }
    localStorage.setItem("savedProperties", JSON.stringify(newSaved));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">Property not found</h1>
        <Link to="/properties" className="mt-6 inline-block text-[var(--primary)] hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  const title = language === 'en' ? property.title : property.titleAr;
  const description = language === 'en' ? property.description : property.descriptionAr;
  const location = language === 'en' ? property.location : property.locationAr;

  // Amenities removed

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto mt-8 mb-24 max-w-7xl px-4 w-full"
    >
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] font-medium transition-colors"
      >
        <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} /> {language === 'en' ? 'Back to Search' : 'العودة للبحث'}
      </Link>

      {/* Gallery */}
      <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <motion.div 
          layoutId={`gallery-main-${property.id}`}
          className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)] shadow-sm relative"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={property.images?.[active] || 'https://via.placeholder.com/1200x800'}
              alt={title}
              className="h-[320px] w-full object-cover md:h-[480px] absolute inset-0"
            />
          </AnimatePresence>
          {/* placeholder for height */}
          <div className="h-[320px] w-full md:h-[480px]"></div>
        </motion.div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 h-[320px] md:h-[480px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
          {property.images?.map((g: string, i: number) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-[12px] border transition-all ${
                active === i ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30 opacity-100" : "border-[var(--border)] opacity-70 hover:opacity-100"
              }`}
            >
              <img src={g} alt="" className="h-28 w-full object-cover md:h-[148px]" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-[var(--foreground)]">{title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] font-medium">
                <MapPin className="h-4 w-4 text-[var(--primary)]" /> {location}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-5 py-3 shadow-sm">
              <p className="text-2xl font-bold text-[var(--primary)]">{formatEGPShort(property.price)}</p>
              {property.status === 'rented' && <p className="text-xs text-[var(--primary)]/80 font-medium text-center">{language === 'en' ? 'per month' : 'شهرياً'}</p>}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Spec icon={Bed} label={language === 'en' ? "Bedrooms" : "غرف النوم"} value={property.bedrooms} />
            <Spec icon={Bath} label={language === 'en' ? "Bathrooms" : "الحمامات"} value={property.bathrooms} />
            <Spec icon={Maximize} label={language === 'en' ? "Size" : "المساحة"} value={`${property.size} ${language === 'en' ? 'sqft' : 'م²'}`} />
            <Spec icon={Calendar} label={language === 'en' ? "Status" : "الحالة"} value={language === 'en' ? property.status : (property.status === 'available' ? 'متاح' : property.status === 'sold' ? 'مباع' : 'مؤجر')} />
          </div>

          <div className="mt-8 rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)]">{language === 'en' ? 'Description' : 'الوصف'}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">{description}</p>
          </div>


        </div>

        {/* Sidebar — agent + actions */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-28">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
              {language === 'en' ? 'Listed by Agency' : 'معروض بواسطة الوكالة'}
            </p>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--secondary)] text-lg font-bold text-[var(--primary)]">
                MR
              </div>
              <div>
                <p className="font-bold text-[var(--foreground)]">Mina Rent</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{language === 'en' ? 'Property Management' : 'إدارة العقارات'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`https://wa.me/201065655100`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
              >
                <MessageCircle className="h-4.5 w-4.5" /> {language === 'en' ? 'WhatsApp' : 'واتساب'}
              </a>
              <a
                href={`tel:+201279229000`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--secondary)] shadow-sm"
              >
                <Phone className="h-4 w-4 text-[var(--primary)]" /> {language === 'en' ? 'Call Now' : 'اتصل الآن'}
              </a>
              <button
                onClick={toggleSave}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-bold transition shadow-sm ${
                  isSaved
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/15"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--text-secondary)]"
                }`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-[var(--primary)] text-[var(--primary)]" : ""}`} />{" "}
                {isSaved
                  ? (language === 'en' ? 'Saved' : 'تم الحفظ')
                  : (language === 'en' ? 'Save Property' : 'حفظ العقار')}
              </button>
            </div>
          </motion.div>
        </aside>
      </div>
    </motion.section>
  );
};

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm text-center md:text-left flex flex-col md:items-start items-center transition-shadow hover:shadow-md"
    >
      <div className="rounded-full bg-[var(--secondary)] p-2.5 w-fit mb-3">
        <Icon className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">{label}</p>
    </motion.div>
  );
}