import React, { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle, Clock, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../contexts/AppContext";
import { sendContactMessage } from "../../../services/api";
import { SEO } from "../../components/ui/SEO";

export const ContactPage: React.FC = () => {
  const { language, isRtl, t } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) return;
    setIsSubmitting(true);
    try {
      await sendContactMessage(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Phone, labelEn: 'Phone', labelAr: 'الهاتف', valueEn: '01279229000', valueAr: '01279229000', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
    { icon: Phone, labelEn: 'Phone 2', labelAr: 'الهاتف 2', valueEn: '+20 10 65655100', valueAr: '+20 10 65655100', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Mail, labelEn: 'Email', labelAr: 'البريد الإلكتروني', valueEn: 'minarent23@gmail.com', valueAr: 'minarent23@gmail.com', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <>
      <SEO 
        title={language === 'en' ? 'Contact Us' : 'اتصل بنا'} 
        description={language === 'en' ? 'Have a question? We\'d love to hear from you.' : 'لديك سؤال؟ يسعدنا سماع رأيك.'} 
      />
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mx-auto py-14 sm:py-20 max-w-7xl px-4 sm:px-6 lg:px-8 w-full page-enter">
        <div className="text-center mb-12">
        <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-[var(--foreground)] tracking-tight">{t('contact.title')}</h1>
        <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">{language === 'en' ? 'Have a question? We\'d love to hear from you.' : 'لديك سؤال؟ يسعدنا سماع رأيك.'}</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          {contactInfo.map((info, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: isRtl ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm premium-card">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${info.color}`}>
                <info.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{language === 'en' ? info.labelEn : info.labelAr}</p>
                <p className="text-sm font-bold text-[var(--foreground)] mt-1 ltr-content">{language === 'en' ? info.valueEn : info.valueAr}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">{language === 'en' ? 'Send us a message' : 'أرسل لنا رسالة'}</h2>

          <AnimatePresence>
            {submitStatus === 'success' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-4 rounded-xl mb-6 flex items-center gap-3 font-medium text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {language === 'en' ? 'Message sent successfully! We\'ll get back to you soon.' : 'تم إرسال الرسالة بنجاح! سنعود إليك قريباً.'}
              </motion.div>
            )}
            {submitStatus === 'error' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">
                {language === 'en' ? 'Failed to send message. Please try again.' : 'فشل إرسال الرسالة. حاول مرة أخرى.'}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('contact.name')} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('contact.email')} *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('contact.phone')} *</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] transition-all" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('contact.message')} *</label>
              <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] resize-none transition-all" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-semibold rounded-xl transition-all disabled:opacity-70 text-sm shadow-sm hover:shadow-lg hover:shadow-[var(--primary)]/20 btn-premium">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t('contact.send')}</>}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.section>
    </>
  );
};