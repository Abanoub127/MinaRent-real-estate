import React, { useEffect, useState } from 'react';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  MapPin,
} from 'lucide-react';

import { useApp } from '../../contexts/AppContext';

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
} from 'recharts';

import { BASE_URL as API } from '../../../services/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

type PropertyType =
  | 'villa'
  | 'apartment'
  | 'house'
  | 'land'
  | 'commercial';

interface Property {
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

  const [properties, setProperties] = useState<Property[]>([]);

  const [stats, setStats] = useState<Stats | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [propertiesRes, statsRes] = await Promise.all([
        fetch(`${API}/properties?limit=1000`, {
          headers: authHeaders(),
        }),

        fetch(`${API}/stats`, {
          headers: authHeaders(),
        }),
      ]);

      const [propertiesData, statsData] = await Promise.all([
        propertiesRes.json(),
        statsRes.json(),
      ]);

      setProperties(
        Array.isArray(propertiesData)
          ? propertiesData
          : propertiesData.properties || []
      );

      setStats(statsData);
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
      type:
        language === 'en'
          ? 'Villa'
          : 'فيلا',

      count: properties.filter(
        (p) => p.type === 'villa'
      ).length,
    },

    {
      type:
        language === 'en'
          ? 'Apartment'
          : 'شقة',

      count: properties.filter(
        (p) => p.type === 'apartment'
      ).length,
    },

    {
      type:
        language === 'en'
          ? 'House'
          : 'منزل',

      count: properties.filter(
        (p) => p.type === 'house'
      ).length,
    },

    {
      type:
        language === 'en'
          ? 'Land'
          : 'أرض',

      count: properties.filter(
        (p) => p.type === 'land'
      ).length,
    },

    {
      type:
        language === 'en'
          ? 'Commercial'
          : 'تجاري',

      count: properties.filter(
        (p) => p.type === 'commercial'
      ).length,
    },
  ].filter((item) => item.count > 0);

const totalViews = properties.reduce(
  (sum, property) => sum + property.views,
  0
);

const conversionData = [
  {
    month:
      language === 'en'
        ? 'Analytics'
        : 'التحليلات',

    views: totalViews,

    bookings:
      stats?.totalBookings || 0,

    sales:
      stats?.confirmedBookings || 0,
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

  const topLocations = Object.values(
  topLocationsMap
).sort((a, b) => b.views - a.views);

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {language === 'en'
          ? 'Analytics'
          : 'التحليلات'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'en'
                  ? 'Total Properties'
                  : 'إجمالي العقارات'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalProperties || 0}
              </h3>
            </div>

            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'en'
                  ? 'Total Bookings'
                  : 'إجمالي الحجوزات'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalBookings || 0}
              </h3>
            </div>

            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <MousePointerClick className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'en'
                  ? 'Confirmed Bookings'
                  : 'الحجوزات المؤكدة'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.confirmedBookings || 0}
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
                  ? 'Clients'
                  : 'العملاء'}
              </p>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalClients || 0}
              </h3>
            </div>

            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'en'
                ? 'Bookings Analytics'
                : 'تحليلات الحجوزات'}
            </h3>

            <div dir="ltr">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart data={conversionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.1}
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#6B7280"
                  />

                  <YAxis stroke="#6B7280" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        'var(--tooltip-bg, #fff)',

                      border:
                        '1px solid #e5e7eb',

                      borderRadius: '8px',
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="views"
                    fill="#3B82F6"
                    name={
                      language === 'en'
                        ? 'Views'
                        : 'المشاهدات'
                    }
                  />

                  <Bar
                    dataKey="bookings"
                    fill="#10B981"
                    name={
                      language === 'en'
                        ? 'Bookings'
                        : 'الحجوزات'
                    }
                  />

                  <Bar
                    dataKey="sales"
                    fill="#F59E0B"
                    name={
                      language === 'en'
                        ? 'Confirmed'
                        : 'المؤكد'
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'en'
                ? 'Properties by Type'
                : 'العقارات حسب النوع'}
            </h3>

            <div dir="ltr">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart data={propertyTypeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.1}
                  />

                  <XAxis
                    dataKey="type"
                    stroke="#6B7280"
                  />

                  <YAxis stroke="#6B7280" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        'var(--tooltip-bg, #fff)',

                      border:
                        '1px solid #e5e7eb',

                      borderRadius: '8px',
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#8B5CF6"
                    name={
                      language === 'en'
                        ? 'Count'
                        : 'العدد'
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'en'
              ? 'Top Locations'
              : 'أفضل المواقع'}
          </h3>

          <div className="space-y-4">
            {topLocations.map(
              (location, index) => (
                <div
                  key={location.location}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {location.location}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {location.properties}{' '}
                        {language === 'en'
                          ? 'properties'
                          : 'عقار'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {location.views}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'en'
                        ? 'views'
                        : 'مشاهدة'}
                    </p>
                  </div>
                </div>
              )
            )}

            {topLocations.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                {language === 'en'
                  ? 'No analytics data found'
                  : 'لا توجد بيانات حالياً'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};