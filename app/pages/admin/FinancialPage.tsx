import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
} from 'lucide-react';

import { useApp } from '../../contexts/AppContext';

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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const API = 'http://localhost:5000/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
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
      const res = await fetch(`${API}/transactions`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      const safeTransactions = Array.isArray(data)
        ? data
        : [];

      setTransactions(safeTransactions);

      const totalRevenue = safeTransactions
        .filter((t: Transaction) => t.type === 'revenue')
        .reduce(
          (sum: number, t: Transaction) => sum + (t.amount || 0),
          0,
        );

      const totalExpenses = safeTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce(
          (sum: number, t: Transaction) => sum + (t.amount || 0),
          0,
        );

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.financial')}
        </h1>

        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />

          {language === 'en'
            ? 'Add Transaction'
            : 'إضافة معاملة'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'en'
                  ? 'Total Revenue'
                  : 'إجمالي الإيرادات'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                EGP{' '}
                {(
                  stats.totalRevenue / 1000000
                ).toFixed(1)}
                M
              </h3>
            </div>

            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'en'
                  ? 'Total Expenses'
                  : 'إجمالي المصروفات'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                EGP{' '}
                {(
                  stats.totalExpenses / 1000
                ).toFixed(0)}
                K
              </h3>
            </div>

            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'en'
                  ? 'Net Profit'
                  : 'صافي الربح'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                EGP{' '}
                {(
                  stats.profit / 1000000
                ).toFixed(1)}
                M
              </h3>
            </div>

            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'en'
                ? 'Revenue by Category'
                : 'الإيرادات حسب الفئة'}
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>
                <Pie
                  data={revenueChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {revenueChartData.map(
                    (_, index) => (
                      <Cell
                        key={`revenue-${index}`}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'en'
                ? 'Expenses by Category'
                : 'المصروفات حسب الفئة'}
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {expenseChartData.map(
                    (_, index) => (
                      <Cell
                        key={`expense-${index}`}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'en'
              ? 'Recent Transactions'
              : 'المعاملات الأخيرة'}
          </h3>

          <div className="space-y-3">
            {transactions
              .slice(0, 10)
              .map((transaction) => {
                const isRevenue =
                  transaction.type ===
                  'revenue';

                return (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isRevenue
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}
                      >
                        {isRevenue ? (
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.category}{' '}
                          •{' '}
                          {transaction.date
                            ? new Date(
                                transaction.date,
                              ).toLocaleDateString()
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`font-bold ${
                        isRevenue
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isRevenue ? '+' : '-'}
                      EGP{' '}
                      {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {language === 'en'
                  ? 'No transactions yet'
                  : 'لا توجد معاملات بعد'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal */}
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
    </div>
  );
};