import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  MapPin,
} from 'lucide-react';

import { useApp } from '../../contexts/AppContext';

import { PageContainer, PageHeader, PageSection } from '../../components/ui/PageContainer';
import { Card } from '../../components/ui/card';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

import { getProperties, getStats } from '../../../services/api';

type PropertyType =
  | 'villa'
  | 'apartment'
  | 'house'
  | 'land'
  | 'commercial';

interface LocalProperty {
  _id: string;
  title: string;
  titleAr: string;
  location: string;
  locationAr: string;
  type: PropertyType;
  views: number;
}

interface Stats {
  totalProperties: number;
  totalBookings: number;
  totalClients: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  monthlyRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
}

export const AnalyticsPage: React.FC = () => {
  const { language } = useApp();

  const [properties, setProperties] = useState<LocalProperty[]>([]);

  const [stats, setStats] = useState<Stats | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [p, s] = await Promise.all([getProperties(1, 100), getStats()]);
      setProperties((p.properties || []) as LocalProperty[]);
      setStats(s);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const propertyTypeData = [
    {
      type: language === 'en' ? 'Villa' : 'فيلا',
      count: properties.filter((p) => p.type === 'villa').length,
    },
    {
      type: language === 'en' ? 'Apartment' : 'شقة',
      count: properties.filter((p) => p.type === 'apartment').length,
    },
    {
      type: language === 'en' ? 'House' : 'منزل',
      count: properties.filter((p) => p.type === 'house').length,
    },
    {
      type: language === 'en' ? 'Land' : 'أرض',
      count: properties.filter((p) => p.type === 'land').length,
    },
    {
      type: language === 'en' ? 'Commercial' : 'تجاري',
      count: properties.filter((p) => p.type === 'commercial').length,
    },
  ].filter((item) => item.count > 0);

  const totalViews = properties.reduce(
    (sum, property) => sum + property.views,
    0
  );

  const conversionData = [
    {
      month: language === 'en' ? 'Analytics' : 'التحليلات',
      views: totalViews,
      bookings: stats?.totalBookings || 0,
      sales: stats?.confirmedBookings || 0,
    },
  ];

  const topLocationsMap = properties.reduce(
    (
      acc: Record<
        string,
        {
          location: string;
          properties: number;
          views: number;
        }
      >,
      property
    ) => {
      const location =
        language === 'en'
          ? property.location
          : property.locationAr;

      if (!acc[location]) {
        acc[location] = {
          location,
          properties: 0,
          views: 0,
        };
      }

      acc[location].properties += 1;

      acc[location].views += property.views;

      return acc;
    },
    {}
  );

  const topLocations = Object.values(topLocationsMap)
    .sort((a, b) => b.views - a.views);

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
          title={language === 'en' ? 'Analytics' : 'التحليلات'}
        />
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">
                  {language === 'en' ? 'Total Properties' : 'إجمالي العقارات'}
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.totalProperties || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">
                  {language === 'en' ? 'Total Bookings' : 'إجمالي الحجوزات'}
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.totalBookings || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <MousePointerClick className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">
                  {language === 'en' ? 'Confirmed Bookings' : 'الحجوزات المؤكدة'}
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.confirmedBookings || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">
                  {language === 'en' ? 'Clients' : 'العملاء'}
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stats?.totalClients || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {language === 'en' ? 'Bookings Analytics' : 'تحليلات الحجوزات'}
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart data={conversionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.1}
                  />

                  <XAxis
                    dataKey="month"
                    stroke="var(--text-secondary)"
                  />

                  <YAxis stroke="var(--text-secondary)" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="views"
                    fill="var(--primary)"
                    name={language === 'en' ? 'Views' : 'المشاهدات'}
                  />

                  <Bar
                    dataKey="bookings"
                    fill="var(--accent)"
                    name={language === 'en' ? 'Bookings' : 'الحجوزات'}
                  />

                  <Bar
                    dataKey="sales"
                    fill="#F59E0B"
                    name={language === 'en' ? 'Confirmed' : 'المؤكد'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {language === 'en' ? 'Properties by Type' : 'العقارات حسب النوع'}
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart data={propertyTypeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.1}
                  />

                  <XAxis
                    dataKey="type"
                    stroke="var(--text-secondary)"
                  />

                  <YAxis stroke="var(--text-secondary)" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                    }}
                  />

                  <Bar
                    dataKey="count"
                    name={language === 'en' ? 'Count' : 'العدد'}
                  >
                    {propertyTypeData.map((entry, index) => {
                      const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </PageSection>

      <PageSection>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              {language === 'en' ? 'Top Locations' : 'أفضل المواقع'}
            </h3>

            <div className="space-y-3">
              {topLocations.map(
                (location, index) => (
                  <div
                    key={location.location}
                    className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {location.location}
                        </p>

                        <p className="text-sm text-[var(--text-secondary)]">
                          {location.properties}{' '}
                          {language === 'en' ? 'properties' : 'عقار'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right pr-4">
                      <p className="font-semibold text-[var(--foreground)]">{location.views}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {language === 'en' ? 'views' : 'مشاهدة'}
                      </p>
                    </div>
                  </div>
                )
              )}

              {topLocations.length === 0 && (
                <div className="text-center text-[var(--text-secondary)] py-6">
                  {language === 'en' ? 'No analytics data found' : 'لا توجد بيانات حالياً'}
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageSection>
    </PageContainer>
  );
};