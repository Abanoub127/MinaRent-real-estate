import React, { useState, useEffect } from 'react';
import { Trash2, Star, MessageSquare } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getTestimonials, deleteTestimonial, Testimonial } from '../../../services/api';

export const AdminCommentsPage: React.FC = () => {
  const { language } = useApp();
  const [comments, setComments] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const data = await getTestimonials();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to delete this comment?' : 'هل أنت متأكد أنك تريد حذف هذا التعليق؟')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting comment", error);
      alert(language === 'en' ? 'Failed to delete comment' : 'فشل في حذف التعليق');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-[var(--secondary)] border-t-[var(--primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {language === 'en' ? 'Manage Comments' : 'إدارة التعليقات'}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {language === 'en' ? 'View and moderate client testimonials.' : 'عرض وإدارة تقييمات العملاء.'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary)] text-[var(--primary)] font-semibold rounded-xl">
          <MessageSquare className="w-5 h-5" />
          <span>{comments.length} {language === 'en' ? 'Comments' : 'تعليق'}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comments.map((comment) => (
          <div 
            key={comment.id} 
            className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col relative group transition-all hover:shadow-md"
          >
            {/* Delete Button */}
            <button
              onClick={() => handleDelete(comment.id)}
              disabled={deletingId === comment.id}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title={language === 'en' ? 'Delete Comment' : 'حذف التعليق'}
            >
              {deletingId === comment.id ? (
                 <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold">
                {(language === 'en' ? comment.name : (comment.nameAr || comment.name))[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-[var(--foreground)] text-sm">
                  {language === 'en' ? comment.name : (comment.nameAr || comment.name)}
                </h4>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < comment.rating ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-gray-300 dark:text-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-[var(--foreground)] text-sm italic mb-4 leading-relaxed flex-1">
              "{language === 'en' ? comment.text : (comment.textAr || comment.text)}"
            </p>
            
            <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
               <span>ID: {comment.id.substring(0, 8)}...</span>
               <span className="px-2 py-1 bg-[var(--secondary)] rounded-md font-medium text-[var(--primary)]">
                 {language === 'en' ? 'Public' : 'عام'}
               </span>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="col-span-full py-16 text-center bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <MessageSquare className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--foreground)]">
              {language === 'en' ? 'No comments found' : 'لا توجد تعليقات'}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              {language === 'en' ? 'When clients leave comments, they will appear here.' : 'عندما يترك العملاء تعليقات، ستظهر هنا.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};