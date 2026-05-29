import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, TextArea } from '../../components/ui/input';
import { Modal } from '../../components/ui/Modal';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '../../components/ui/Select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BASE_URL as API } from '../../../services/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

type TransactionType = 'revenue' | 'expense';

interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const FinancialPage: React.FC = () => {
  const { t, language } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats>({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
  const [formData, setFormData] = useState({
    type: 'revenue' as TransactionType,
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API}/transactions`, { headers: authHeaders() });
      const data = await res.json();
      const safe: Transaction[] = Array.isArray(data) ? data : [];
      setTransactions(safe);
      const totalRevenue = safe.filter(t => t.type === 'revenue').reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalExpenses = safe.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
      setStats({ totalRevenue, totalExpenses, profit: totalRevenue - totalExpenses });
    } catch (error) {
      console.error(error);
      setTransactions([]);
      setStats({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ type: 'revenue', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          type: formData.type,
          amount: Number(formData.amount) || 0,
          description: formData.description,
          category: formData.category,
          date: formData.date,
          notes: formData.notes,
        }),
      });
      await fetchTransactions();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const revenueChartData = useMemo(() => {
    const map = transactions.filter(t => t.type === 'revenue').reduce((acc, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const expenseChartData = useMemo(() => {
    const map = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const formatAmount = (n: number) => {
    if (n >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `EGP ${(n / 1_000).toFixed(0)}K`;
    return `EGP ${n.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl" />
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات',
      value: formatAmount(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800/30',
      trend: '+',
    },
    {
      label: language === 'en' ? 'Total Expenses' : 'إجمالي المصروفات',
      value: formatAmount(stats.totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800/30',
      trend: '-',
    },
    {
      label: language === 'en' ? 'Net Profit' : 'صافي الربح',
      value: formatAmount(Math.abs(stats.profit)),
      icon: Wallet,
      color: stats.profit >= 0 ? 'text-[var(--primary)]' : 'text-red-600 dark:text-red-400',
      bg: stats.profit >= 0 ? 'bg-[var(--primary)]/5' : 'bg-red-50 dark:bg-red-900/20',
      border: stats.profit >= 0 ? 'border-[var(--primary)]/20' : 'border-red-200 dark:border-red-800/30',
      trend: stats.profit >= 0 ? '+' : '-',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('admin.financial')}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {language === 'en' ? 'Track your revenue and expenses' : 'تتبع إيراداتك ومصروفاتك'}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'Add Transaction' : 'إضافة معاملة'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`p-6 rounded-2xl border ${s.border} ${s.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">{s.label}</p>
                  <h3 className={`text-2xl font-bold ${s.color}`}>{s.value}</h3>
                </div>
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center border ${s.border}`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
              {language === 'en' ? 'Revenue by Category' : 'الإيرادات حسب الفئة'}
            </h3>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={revenueChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {revenueChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `EGP ${v.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-[var(--text-secondary)] text-sm">
                {language === 'en' ? 'No revenue data yet' : 'لا توجد بيانات إيرادات'}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
              {language === 'en' ? 'Expenses by Category' : 'المصروفات حسب الفئة'}
            </h3>
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={expenseChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {expenseChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `EGP ${v.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-[var(--text-secondary)] text-sm">
                {language === 'en' ? 'No expense data yet' : 'لا توجد بيانات مصروفات'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <div className="p-6">
          <h3 className="text-base font-bold text-[var(--foreground)] mb-5">
            {language === 'en' ? 'Recent Transactions' : 'المعاملات الأخيرة'}
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 10).map(tr => {
              const isRevenue = tr.type === 'revenue';
              return (
                <div
                  key={tr._id}
                  className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isRevenue ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {isRevenue
                        ? <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        : <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{tr.description}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {tr.category} · {tr.date ? new Date(tr.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${isRevenue ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isRevenue ? '+' : '-'}EGP {tr.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                {language === 'en' ? 'No transactions yet' : 'لا توجد معاملات بعد'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={language === 'en' ? 'Add Transaction' : 'إضافة معاملة'}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit}>{t('common.save')}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Type' : 'النوع'}</label>
            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as TransactionType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">{language === 'en' ? 'Revenue' : 'إيرادات'}</SelectItem>
                <SelectItem value="expense">{language === 'en' ? 'Expense' : 'مصروفات'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input label={language === 'en' ? 'Amount (EGP)' : 'المبلغ (جنيه)'} type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
          <Input label={language === 'en' ? 'Description' : 'الوصف'} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
          <Input label={language === 'en' ? 'Category' : 'الفئة'} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required placeholder={language === 'en' ? 'e.g. Sales, Marketing, Rent' : 'مثال: مبيعات، تسويق، إيجار'} />
          <Input label={language === 'en' ? 'Date' : 'التاريخ'} type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
          <TextArea name="notes" label={language === 'en' ? 'Notes' : 'ملاحظات'} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} />
        </form>
      </Modal>
    </div>
  );
};