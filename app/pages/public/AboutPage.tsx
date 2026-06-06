import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ShieldCheck, Star, HeadphonesIcon, Building2, Phone, Mail } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const AboutPage: React.FC = () => {
  const { language, isRtl } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-[#1B2B4B] pt-20 pb-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-[var(--gold-500)]/5 blur-2xl float-slow" />
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-[var(--navy-400)]/10 blur-3xl float-medium" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {language === 'en' ? 'About Us' : 'من نحن'}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'Your trusted partner in finding the perfect property.' 
                : 'شريكك الموثوق في العثور على العقار المثالي.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 relative inline-block">
                {language === 'en' ? 'Our Story' : 'قصتنا'}
                <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-[var(--accent)] rounded-full" />
              </h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
                {language === 'en'
                  ? 'Mina Rent is a specialized real estate platform for renting luxury properties in Egypt. We offer a curated selection of the finest apartments and villas with a professional and modern approach.'
                  : 'مينا رنت منصة عقارية متخصصة في تأجير العقارات الفاخرة في مصر. نقدم مجموعة منتقاة من أفضل الشقق والفيلات بأسلوب احترافي وعصري.'}
              </p>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                {language === 'en'
                  ? 'Our mission is to simplify the rental process and provide our clients with an exceptional experience from start to finish.'
                  : 'مهمتنا هي تبسيط عملية التأجير وتقديم تجربة استثنائية لعملائنا من البداية وحتى النهاية.'}
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-[var(--secondary)]"
            >
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Property" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B2B4B]/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <Building2 className="w-10 h-10 text-[var(--accent)] mb-3" />
                <h3 className="text-xl font-bold">{language === 'en' ? 'Excellence in Real Estate' : 'التميز في العقارات'}</h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-50px' }} 
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { num: '300+', labelEn: 'Premium Properties', labelAr: 'عقارات مميزة' },
              { num: '100%', labelEn: 'Client Satisfaction', labelAr: 'معدل رضا العملاء' },
              { num: '24/7', labelEn: 'Customer Support', labelAr: 'خدمة على مدار الساعة' },
            ].map((stat, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeInUp} 
                className="p-8 text-center rounded-2xl bg-[var(--background)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-5xl font-black text-[var(--accent)] mb-4">{stat.num}</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {language === 'en' ? stat.labelEn : stat.labelAr}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              {language === 'en' ? 'Our Values' : 'قيمنا'}
            </h2>
            <div className="w-20 h-1 bg-[var(--accent)] rounded-full mx-auto" />
          </div>

          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-50px' }} 
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: ShieldCheck, titleEn: 'Trust & Transparency', titleAr: 'الثقة والشفافية', descEn: 'We believe in clear communication and honest dealings.', descAr: 'نؤمن بالتواصل الواضح والتعاملات الصادقة.' },
              { icon: Star, titleEn: 'Quality & Excellence', titleAr: 'الجودة والتميز', descEn: 'We curate only the finest properties for our clients.', descAr: 'ننتقي فقط أفضل العقارات لعملائنا.' },
              { icon: HeadphonesIcon, titleEn: 'Customer Service', titleAr: 'خدمة العملاء', descEn: 'Your satisfaction is our top priority, always.', descAr: 'رضاك هو أولويتنا القصوى، دائماً.' }
            ].map((val, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeInUp} 
                className="premium-card flex flex-col items-center text-center p-10 rounded-2xl bg-[var(--card)] border border-[var(--border)] group"
              >
                <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                  <val.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                  {language === 'en' ? val.titleEn : val.titleAr}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {language === 'en' ? val.descEn : val.descAr}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section className="py-20 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="bg-[#1B2B4B] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6">
                {language === 'en' ? 'Get In Touch' : 'تواصل معنا'}
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                {language === 'en' 
                  ? 'We are here to help you find your next perfect home. Reach out to us for any inquiries.'
                  : 'نحن هنا لمساعدتك في العثور على منزلك المثالي التالي. تواصل معنا لأي استفسارات.'}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-white/90">
                <div className="flex items-center gap-3">
                  <Phone className="text-[var(--accent)] w-5 h-5" />
                  <span dir="ltr">01279229000</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="flex items-center gap-3">
                  <Mail className="text-[var(--accent)] w-5 h-5" />
                  <span>minarent23@gmail.com</span>
                </div>
              </div>

              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-[var(--accent)] text-[#1B2B4B] font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all text-lg shadow-lg shadow-[var(--accent)]/20"
              >
                {language === 'en' ? 'Contact Us Now' : 'تواصل معنا الآن'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
