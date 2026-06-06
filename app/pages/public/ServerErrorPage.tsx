import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Home, RefreshCw } from 'lucide-react';

interface ServerErrorPageProps {
  onRetry?: () => void;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({ onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
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
        {/* 500 number */}
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
          500
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
          حدث خطأ في الخادم
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-white/60 text-base mb-10 leading-relaxed"
        >
          نعمل على إصلاح المشكلة في أقرب وقت ممكن.
          <br />يُرجى المحاولة مرة أخرى بعد قليل.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95"
            style={{ background: '#C9A84C', color: '#1B2B4B' }}
          >
            <RefreshCw size={18} />
            المحاولة مرة أخرى
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-white/10 active:scale-95 border"
            style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,0.4)' }}
          >
            <Home size={18} />
            الرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServerErrorPage;
