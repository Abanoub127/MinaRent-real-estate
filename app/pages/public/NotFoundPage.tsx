import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div
    className="min-h-screen flex items-center justify-center p-6"
    style={{ background: '#1B2B4B', direction: 'rtl' }}
  >
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="text-center max-w-lg w-full"
    >
      {/* 404 number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        style={{
          fontSize: 'clamp(6rem, 20vw, 12rem)',
          fontWeight: 900,
          lineHeight: 1,
          color: '#C9A84C',
          letterSpacing: '-0.04em',
          textShadow: '0 0 60px rgba(201,168,76,0.25)',
        }}
      >
        404
      </motion.div>

      {/* Divider line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ background: '#C9A84C', height: 2, borderRadius: 2, margin: '1.5rem auto', width: '6rem' }}
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="text-2xl md:text-3xl font-bold text-white mb-3"
      >
        الصفحة غير موجودة
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="text-white/60 text-base mb-10 leading-relaxed"
      >
        يبدو أن هذه الصفحة لا وجود لها، أو ربما تم نقلها.
        <br />تحقق من الرابط أو عُد إلى الرئيسية.
      </motion.p>

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95"
          style={{ background: '#C9A84C', color: '#1B2B4B' }}
        >
          <Home size={18} />
          العودة للرئيسية
        </Link>
      </motion.div>
    </motion.div>
  </div>
);

export default NotFoundPage;
