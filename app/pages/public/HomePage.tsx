import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, MapPin, Home, Building2, Star, Users, Shield, ArrowRight, Send, TrendingUp, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getTestimonials, Property, Testimonial, formatEGPShort, createTestimonial, togglePropertyLike } from '../../../services/api';
import { MRLogo } from '../../components/ui/MRLogo';
import { ProtectedImage } from '../../components/ProtectedImage';
import { SEO } from '../../components/ui/SEO';

export const HomePage: React.FC = () => {
  const { language, isRtl, t } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Comment Form
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Testimonials Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const testimonialsPerPage = 6;

  // Saved Properties
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedProperties") || "[]");
    setSavedProperties(saved);
    fetchData(); 
  }, []);

  const toggleSaveProperty = async (propId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("savedProperties") || "[]");
    const isSaved = saved.includes(propId);
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((id: string) => id !== propId);
    } else {
      newSaved = [...saved, propId];
    }
    localStorage.setItem("savedProperties", JSON.stringify(newSaved));
    setSavedProperties(newSaved);
    
    try {
      await togglePropertyLike(propId, isSaved ? 'remove' : 'add');
    } catch (error) {
      console.error('Failed to toggle like on backend:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [propsRes, testsRes] = await Promise.all([getProperties(1, 3), getTestimonials()]);
      setProperties(propsRes.properties);
      setTestimonials(testsRes);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await createTestimonial({ name: commentName, nameAr: commentName, text: commentText, textAr: commentText, rating: commentRating });
      setSubmitSuccess(true);
      setCommentName(''); setCommentText(''); setCommentRating(5);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (error) { console.error("Error submitting comment:", error); }
    finally { setIsSubmitting(false); }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

  // Pagination logic
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const paginatedTestimonials = testimonials.slice(
    (currentPage - 1) * testimonialsPerPage,
    currentPage * testimonialsPerPage
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SEO />
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden min-h-[100svh] flex flex-col justify-center">
        <div className="gradient-hero absolute inset-0 opacity-95" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        {/* Floating decorative elements — hidden on mobile to prevent layout issues */}
        <div className="hidden sm:block absolute top-20 right-10 w-32 h-32 rounded-full bg-[var(--gold-500)]/5 blur-2xl float-slow" />
        <div className="hidden sm:block absolute bottom-20 left-10 w-40 h-40 rounded-full bg-[var(--navy-400)]/10 blur-3xl float-medium" />
        <div className="hidden sm:block absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-[var(--gold-400)]/8 blur-xl float-fast" />
        <div className="hidden sm:block absolute bottom-10 right-1/3 w-2 h-2 rounded-full bg-[var(--gold-400)]/40 float-slow" />
        <div className="hidden sm:block absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-white/10 float-medium" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col gap-5 w-full"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 font-medium text-sm w-fit border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
                {language === 'en' ? 'Premium Properties in Egypt' : 'عقارات فاخرة في مصر'}
              </div>

              <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold text-white leading-[1.15] tracking-tight">
                {language === 'en' ? (
                  <>Find Your Perfect <span className="text-shimmer-gold">Space</span> With Us</>
                ) : (
                  <>اعثر على <span className="text-shimmer-gold">مساحتك</span> المثالية معنا</>
                )}
              </h1>

              <p className="text-[clamp(1rem,2vw,1.125rem)] text-white/70 leading-relaxed max-w-lg">
                {language === 'en'
                  ? 'Discover curated properties that match your lifestyle. From modern apartments to luxury villas, your next chapter starts here.'
                  : 'اكتشف عقارات منتقاة بعناية تناسب أسلوب حياتك. من الشقق الحديثة إلى الفيلات الفاخرة، فصلك القادم يبدأ هنا.'}
              </p>

              {/* Search Bar */}
              <div className="mt-1 flex items-center p-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl w-full max-w-lg">
                <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
                  <MapPin className="w-4 h-4 text-white/50 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'en' ? 'Search by location...' : 'ابحث بالموقع...'}
                    className="w-full min-w-0 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 py-2"
                  />
                </div>
                <Link
                  to={searchQuery ? `/properties?q=${encodeURIComponent(searchQuery)}` : '/properties'}
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 btn-premium"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden xs:inline">{language === 'en' ? 'Search' : 'بحث'}</span>
                </Link>
              </div>
            </motion.div>

            {/* Hero Logo — only visible on large screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="absolute w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-3xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 sm:p-14 pulse-glow">
                <MRLogo size="xl" showText={true} animated={true} dark={true} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[var(--card)] py-20 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-6.25rem" }} className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] md:grid-cols-3 gap-8">
            {[
              { icon: Home, titleEn: 'Vast Selection', titleAr: 'تشكيلة واسعة', descEn: 'Browse thousands of verified properties in prime locations.', descAr: 'تصفح آلاف العقارات الموثقة في مواقع متميزة.' },
              { icon: Shield, titleEn: 'Secure Transactions', titleAr: 'معاملات آمنة', descEn: 'Your investments are protected with our transparent process.', descAr: 'استثماراتك محمية بفضل إجراءاتنا الشفافة.' },
              { icon: Users, titleEn: 'Expert Agents', titleAr: 'وكلاء خبراء', descEn: 'Our local experts guide you every step of the way.', descAr: 'خبراؤنا المحليون يرافقونك في كل خطوة.' }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="premium-card flex flex-col items-center text-center p-8 rounded-2xl hover:bg-[var(--secondary)] transition-all duration-300 group cursor-default">
                <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{language === 'en' ? feature.titleEn : feature.titleAr}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{language === 'en' ? feature.descEn : feature.descAr}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
              {language === 'en' ? 'Featured Properties' : 'العقارات المميزة'}
            </h2>
            <p className="text-[var(--text-secondary)]">{language === 'en' ? 'Explore our hand-picked selection of premium real estate.' : 'استكشف تشكيلتنا المختارة بعناية من العقارات الفاخرة.'}</p>
          </div>
          <Link to="/properties" className="hidden md:flex items-center gap-2 text-[var(--primary)] font-semibold hover:gap-3 transition-all text-sm">
            {language === 'en' ? 'View All' : 'عرض الكل'}
            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-5 skeleton w-3/4 rounded-lg" />
                  <div className="h-4 skeleton w-1/2 rounded-lg" />
                  <div className="h-10 skeleton rounded-lg mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-6">
            {properties.map(property => (
              <motion.div key={property.id} variants={itemVariants}>
                <Link to={`/properties/${property.id}`} className="group flex flex-col bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm premium-card">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ProtectedImage src={property.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'} alt={property.title} containerClassName="w-full h-full" className="transform transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 start-3 z-10 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-[var(--foreground)] text-xs font-bold rounded-lg capitalize shadow-sm">{language === 'en' ? property.type : (property.type === 'villa' ? 'فيلا' : property.type === 'apartment' ? 'شقة' : property.type)}</span>
                    </div>
                    <button
                      onClick={(e) => toggleSaveProperty(property.id || property._id || '', e)}
                      className="absolute end-3 top-3 z-10 px-2.5 py-1.5 flex items-center gap-1.5 rounded-full bg-[var(--card)]/80 hover:bg-[var(--card)] text-[var(--text-secondary)] hover:text-red-500 backdrop-blur shadow-md transition-all active:scale-95"
                      aria-label="Save Property"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          savedProperties.includes(property.id || property._id || '')
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      <span className="text-xs font-bold leading-none mt-[0.0625rem]">{property.likes || 0}</span>
                    </button>
                    <div className="absolute bottom-3 end-3 z-10">
                      <span className="px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold rounded-lg shadow-lg">{formatEGPShort(property.price)}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1.5 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">{language === 'en' ? property.title : property.titleAr}</h3>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-4 text-sm">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{language === 'en' ? property.location : property.locationAr}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-[var(--border)] mt-auto text-xs">
                      <div className="flex flex-col items-center text-[var(--text-secondary)]"><span className="font-bold text-[var(--foreground)]">{property.bedrooms}</span>{language === 'en' ? 'Beds' : 'غرف'}</div>
                      <div className="flex flex-col items-center text-[var(--text-secondary)] border-x border-[var(--border)]"><span className="font-bold text-[var(--foreground)]">{property.bathrooms}</span>{language === 'en' ? 'Baths' : 'حمامات'}</div>
                      <div className="flex flex-col items-center text-[var(--text-secondary)]"><span className="font-bold text-[var(--foreground)]">{property.size}</span>m²</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl btn-premium">
            {language === 'en' ? 'View All Properties' : 'عرض جميع العقارات'}
            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      {/* ── Testimonials & Comment Form ── */}
      <section className="bg-[var(--secondary)] py-20 border-t border-[var(--border)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Comment Form */}
            <motion.div initial={{ opacity: 0, x: isRtl ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[var(--card)] p-7 rounded-2xl shadow-lg border border-[var(--border)]">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{language === 'en' ? 'Leave a Comment' : 'أضف تعليقك'}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-5">{language === 'en' ? 'Share your experience with us.' : 'شارك تجربتك معنا.'}</p>

              <AnimatePresence>
                {submitSuccess && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 p-3 rounded-xl mb-5 text-sm font-medium text-center">
                    {language === 'en' ? '✨ Thank you! Your comment is under review.' : '✨ شكراً! تعليقك قيد المراجعة.'}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <input type="text" required value={commentName} onChange={(e) => setCommentName(e.target.value)} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] transition-all" placeholder={language === 'en' ? 'Your Name' : 'اسمك'} />
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setCommentRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 transition-colors ${star <= commentRating ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea required rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] resize-none transition-all" placeholder={language === 'en' ? 'Your experience...' : 'تجربتك...'} />
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-semibold rounded-xl transition-all disabled:opacity-70 text-sm btn-premium">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />{language === 'en' ? 'Post Comment' : 'نشر التعليق'}</>}
                </button>
              </form>
            </motion.div>

            {/* Testimonials */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">{language === 'en' ? 'Client Stories' : 'قصص العملاء'}</h2>
                <p className="text-[var(--text-secondary)]">{language === 'en' ? "Read what our clients have to say about their experience." : "اقرأ ما يقوله عملاؤنا عن تجربتهم."}</p>
              </div>

              {testimonials.length === 0 ? (
                <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                  <Star className="w-10 h-10 text-[var(--border)] mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)]">{language === 'en' ? 'No reviews yet. Be the first!' : 'لا توجد تقييمات بعد. كن أول من يقيّم!'}</p>
                </div>
              ) : (
                <>
                  <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5">
                    {paginatedTestimonials.map(testimonial => (
                      <motion.div key={testimonial.id} variants={itemVariants} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] hover:shadow-md transition-all premium-card">
                        <div className="flex gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-[var(--accent)] fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                          ))}
                        </div>
                        <p className="text-[var(--foreground)] italic text-sm mb-4 leading-relaxed line-clamp-3">"{language === 'en' ? testimonial.text : (testimonial.textAr || testimonial.text)}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center font-bold text-sm">
                            {(language === 'en' ? testimonial.name : (testimonial.nameAr || testimonial.name))[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-[var(--foreground)] text-sm">{language === 'en' ? testimonial.name : (testimonial.nameAr || testimonial.name)}</h4>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--secondary)] disabled:opacity-40 transition-all"
                      >
                        <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                            currentPage === i + 1
                              ? 'bg-[var(--primary)] text-white shadow-md'
                              : 'border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--secondary)]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--secondary)] disabled:opacity-40 transition-all"
                      >
                        <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};