import React, { useState, useEffect, useCallback } from 'react';
import { Mail, MailOpen, Reply, Trash2, Search, Filter, Send, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { getMessages, markMessageRead, markMessageUnread, replyToMessage, deleteMessage, Message, MessagesResponse } from '../../../services/api';

export const MessagesPage: React.FC = () => {
  const { language } = useApp();
  const [data, setData] = useState<MessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMessages(page, 15, statusFilter, search);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleRead = async (m: Message) => {
    try { await markMessageRead(m.id); fetchMessages(); if (selected?.id === m.id) setSelected({ ...m, status: 'read' }); } catch {}
  };
  const handleUnread = async (m: Message) => {
    try { await markMessageUnread(m.id); fetchMessages(); } catch {}
  };
  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this message?' : 'حذف هذه الرسالة؟')) return;
    try { await deleteMessage(id); if (selected?.id === id) setSelected(null); fetchMessages(); } catch {}
  };
  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try { await replyToMessage(selected.id, replyText); setReplyText(''); setSelected(null); fetchMessages(); } catch {}
    finally { setReplying(false); }
  };
  const openMessage = async (m: Message) => {
    setSelected(m);
    if (m.status === 'unread') { try { await markMessageRead(m.id); fetchMessages(); } catch {} }
  };

  const statusColors: Record<string, string> = {
    unread: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    read: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    replied: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-[var(--foreground)]">{language === 'en' ? 'Messages' : 'الرسائل'}</h1><p className="text-[var(--text-secondary)] text-sm mt-0.5">{language === 'en' ? 'Manage incoming messages from contact forms.' : 'إدارة الرسائل الواردة من نماذج الاتصال.'}</p></div>
        {data && <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl text-sm">{data.unreadCount} {language === 'en' ? 'unread' : 'غير مقروءة'}</span>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl"><Search className="w-4 h-4 text-[var(--text-secondary)]" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={language === 'en' ? 'Search messages...' : 'بحث في الرسائل...'} className="w-full bg-transparent text-sm outline-none text-[var(--foreground)]" /></div>
        <div className="flex gap-2">
          {['all', 'unread', 'read', 'replied'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>
              {language === 'en' ? s.charAt(0).toUpperCase() + s.slice(1) : (s === 'all' ? 'الكل' : s === 'unread' ? 'غير مقروءة' : s === 'read' ? 'مقروءة' : 'تم الرد')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          {loading ? <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}</div> : !data || data.messages.length === 0 ? (
            <div className="p-12 text-center"><Mail className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" /><p className="text-[var(--text-secondary)] text-sm">{language === 'en' ? 'No messages found.' : 'لا توجد رسائل.'}</p></div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {data.messages.map(m => (
                <button key={m.id} onClick={() => openMessage(m)} className={`w-full text-left p-4 hover:bg-[var(--secondary)] transition-colors ${selected?.id === m.id ? 'bg-[var(--primary)]/5' : ''} ${m.status === 'unread' ? 'bg-[var(--primary)]/3' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${m.status === 'unread' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--secondary)] text-[var(--text-secondary)]'}`}>{m.senderName[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2"><span className={`text-sm truncate ${m.status === 'unread' ? 'font-bold text-[var(--foreground)]' : 'font-medium text-[var(--foreground)]'}`}>{m.senderName}</span><span className="text-[10px] text-[var(--text-secondary)] shrink-0">{new Date(m.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}</span></div>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{m.message}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusColors[m.status] || ''}`}>{m.status}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg disabled:opacity-40">{language === 'en' ? 'Prev' : 'السابق'}</button>
              <span className="text-xs text-[var(--text-secondary)]">{page} / {data.totalPages}</span>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg disabled:opacity-40">{language === 'en' ? 'Next' : 'التالي'}</button>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <div><h3 className="font-bold text-[var(--foreground)]">{selected.senderName}</h3><p className="text-xs text-[var(--text-secondary)] mt-0.5">{selected.senderEmail} · {selected.senderPhone}</p></div>
                <div className="flex gap-1">
                  {selected.status === 'unread' ? <button onClick={() => handleRead(selected)} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg text-[var(--text-secondary)]" title="Mark read"><MailOpen className="w-4 h-4" /></button> : <button onClick={() => handleUnread(selected)} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg text-[var(--text-secondary)]" title="Mark unread"><Mail className="w-4 h-4" /></button>}
                  <button onClick={() => handleDelete(selected.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mb-3">{new Date(selected.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</div>
              <div className="bg-[var(--secondary)] p-4 rounded-xl text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap mb-5">{selected.message}</div>
              {selected.reply && (
                <div className="mb-5"><p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-1"><Reply className="w-3.5 h-3.5" /> {language === 'en' ? 'Your reply' : 'ردك'}</p><div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-sm text-green-800 dark:text-green-300 leading-relaxed whitespace-pre-wrap">{selected.reply}</div></div>
              )}
              {selected.status !== 'replied' && (
                <div className="space-y-3">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} className="w-full px-4 py-3 bg-[var(--input-background)] dark:bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder={language === 'en' ? 'Write your reply...' : 'اكتب ردك...'} />
                  <button onClick={handleReply} disabled={replying || !replyText.trim()} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                    {replying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" />{language === 'en' ? 'Send Reply' : 'إرسال الرد'}</>}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center shadow-sm sticky top-24">
              <Eye className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--text-secondary)] text-sm">{language === 'en' ? 'Select a message to view.' : 'اختر رسالة لعرضها.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
