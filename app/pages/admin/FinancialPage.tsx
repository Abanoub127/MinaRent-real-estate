import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { PageContainer, PageHeader, PageSection } from '../../components/ui/PageContainer';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, TextArea } from '../../components/ui/input';
import { Modal } from '../../components/ui/Modal';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../components/ui/Select';
import {
  getTransactions, createTransaction, type Transaction, formatCurrency
} from '../../../services/api';

type TransactionType = 'revenue' | 'expense';

interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

export const FinancialPage: React.FC = () => {
  const { t, language } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
  });

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
      const t = await getTransactions();
      setTransactions(Array.isArray(t) ? t : []);
      const totalRevenue = t.filter((item) => item.type === 'revenue').reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalExpenses = t.filter((item) => item.type === 'expense').reduce((sum, item) => sum + (item.amount || 0), 0);
      setStats({
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
      });
    } catch (error) {
      console.error(error);
      setTransactions([]);
      setStats({
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);

    setFormData({
      type: 'revenue',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    try {
      await createTransaction({
        type: formData.type,
        amount: Number(formData.amount) || 0,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
      });

      await fetchTransactions();

      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const revenueChartData = useMemo(() => {
    const revenueByCategory = transactions
      .filter((t) => t.type === 'revenue')
      .reduce(
        (acc, transaction) => {
          const category =
            transaction.category || 'Other';

          acc[category] =
            (acc[category] || 0) +
            transaction.amount;

          return acc;
        },
        {} as Record<string, number>,
      );

    return Object.entries(
      revenueByCategory,
    ).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const expenseChartData = useMemo(() => {
    const expenseByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, transaction) => {
          const category =
            transaction.category || 'Other';

          acc[category] =
            (acc[category] || 0) +
            transaction.amount;

          return acc;
        },
        {} as Record<string, number>,
      );

    return Object.entries(
      expenseByCategory,
    ).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
  ];

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading...
      </div>
    );
  }

  return (
    <PageContainer>
      <PageSection>
        <PageHeader
          title={t('admin.financial')}
          description={language === 'en' ? 'Track your financial performance' : 'تتبع الأداء المالي'}
          action={
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {language === 'en' ? 'Add Transaction' : 'إضافة معاملة'}
            </Button>
          }
        />
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}
            value={formatCurrency(stats.totalRevenue)}
            icon={<TrendingUp className="w-full h-full" />}
            variant="success"
          />
          <StatCard
            title={language === 'en' ? 'Total Expenses' : 'إجمالي المصروفات'}
            value={formatCurrency(stats.totalExpenses)}
            icon={<TrendingDown className="w-full h-full" />}
            variant="danger"
          />
          <StatCard
            title={language === 'en' ? 'Net Profit' : 'صافي الربح'}
            value={formatCurrency(stats.profit)}
            icon={<DollarSign className="w-full h-full" />}
            variant="primary"
          />
        </div>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {language === 'en' ? 'Revenue by Category' : 'الإيرادات حسب الفئة'}
              </h3>
              <div className="flex flex-col xl:flex-row items-center gap-6">
                <div className="w-full xl:w-1/2 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full xl:w-1/2 flex flex-col gap-3">
                  {revenueChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-xl hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-semibold text-[var(--foreground)]">{entry.name}</span>
                      </div>
                      <span className="text-sm font-bold text-[var(--foreground)]" dir="ltr">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                  {revenueChartData.length === 0 && (
                    <div className="text-center py-4 text-sm text-[var(--text-secondary)]">
                      {language === 'en' ? 'No data available' : 'لا توجد بيانات'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {language === 'en' ? 'Expenses by Category' : 'المصروفات حسب الفئة'}
              </h3>
              <div className="flex flex-col xl:flex-row items-center gap-6">
                <div className="w-full xl:w-1/2 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                     <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full xl:w-1/2 flex flex-col gap-3">
                  {expenseChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-xl hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-semibold text-[var(--foreground)]">{entry.name}</span>
                      </div>
                      <span className="text-sm font-bold text-[var(--foreground)]" dir="ltr">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                  {expenseChartData.length === 0 && (
                    <div className="text-center py-4 text-sm text-[var(--text-secondary)]">
                      {language === 'en' ? 'No data available' : 'لا توجد بيانات'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageSection>

      <PageSection>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              {language === 'en' ? 'Recent Transactions' : 'المعاملات الأخيرة'}
            </h3>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => {
                const isRevenue = transaction.type === 'revenue';
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isRevenue
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        {isRevenue ? (
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)] text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {transaction.category} • {transaction.date ? new Date(transaction.date).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-sm pr-4 ${
                        isRevenue
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isRevenue ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  {language === 'en' ? 'No transactions yet' : 'لا توجد معاملات بعد'}
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageSection>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          language === 'en'
            ? 'Add Transaction'
            : 'إضافة معاملة'
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              {t('common.cancel')}
            </Button>

            <Button onClick={handleSubmit}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="text-sm mb-1 block">
              {language === 'en'
                ? 'Type'
                : 'النوع'}
            </label>

            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type:
                    value as TransactionType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="revenue">
                  {language === 'en'
                    ? 'Revenue'
                    : 'إيرادات'}
                </SelectItem>

                <SelectItem value="expense">
                  {language === 'en'
                    ? 'Expense'
                    : 'مصروفات'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            label={
              language === 'en'
                ? 'Amount (EGP)'
                : 'المبلغ (جنيه)'
            }
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: e.target.value,
              })
            }
            required
          />

          <Input
            label={
              language === 'en'
                ? 'Description'
                : 'الوصف'
            }
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value,
              })
            }
            required
          />

          <Input
            label={
              language === 'en'
                ? 'Category'
                : 'الفئة'
            }
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value,
              })
            }
            required
            placeholder={
              language === 'en'
                ? 'e.g. Sales, Marketing, Rent'
                : 'مثال: مبيعات، تسويق، إيجار'
            }
          />

          <Input
            label={
              language === 'en'
                ? 'Date'
                : 'التاريخ'
            }
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({
                ...formData,
                date: e.target.value,
              })
            }
            required
          />

          <TextArea
            name="notes"
            label={language === 'en' ? 'Notes' : 'ملاحظات'}
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            rows={3}
          />
        </form>
      </Modal>
    </PageContainer>
  );
};