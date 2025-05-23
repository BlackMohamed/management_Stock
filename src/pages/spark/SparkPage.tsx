// src/pages/spark/SparkPage.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  History,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const SparkPage: React.FC = () => {
  const { state } = useAuth();
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    totalValue: 0,
    categoryValues: [],
  });
  const [movements, setMovements] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchData = async () => {
    if (!state.isAuthenticated) {
      setError('Vous devez être connecté pour voir les insights.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [statisticsResponse, movementsResponse, alertsResponse] = await Promise.all([
        axios.get('http://localhost:5000/analytics/statistics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/movements', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/alerts', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log('Statistics Response:', statisticsResponse.data);
      if (statisticsResponse.data && typeof statisticsResponse.data === 'object' && 
          'totalProducts' in statisticsResponse.data && 
          'totalStock' in statisticsResponse.data && 
          'lowStockProducts' in statisticsResponse.data && 
          'totalValue' in statisticsResponse.data && 
          Array.isArray(statisticsResponse.data.categoryValues)) {
        setStatistics(statisticsResponse.data);
      } else {
        console.warn('Invalid statistics format:', statisticsResponse.data);
        setStatistics({ totalProducts: 0, totalStock: 0, lowStockProducts: 0, totalValue: 0, categoryValues: [] });
      }

      console.log('Movements Response:', movementsResponse.data);
      if (Array.isArray(movementsResponse.data)) {
        setMovements(movementsResponse.data);
      } else {
        console.warn('Invalid movements format:', movementsResponse.data);
        setMovements([]);
      }

      console.log('Alerts Response:', alertsResponse.data);
      if (Array.isArray(alertsResponse.data)) {
        setAlerts(alertsResponse.data);
      } else {
        console.warn('Invalid alerts format:', alertsResponse.data);
        setAlerts([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des données';
      console.error('Fetch error:', {
        message: errorMessage,
        status: err.response?.status,
        url: err.response?.config?.url,
        details: err.response?.data,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setIsVisible(true);
  }, [state.isAuthenticated]);

  // Prepare data for charts
  const categoryData = statistics.categoryValues.reduce((acc: { [key: string]: number }, item) => {
    acc[item.category || 'Inconnu'] = (acc[item.category || 'Inconnu'] || 0) + 1;
    return acc;
  }, {});
  console.log('Category Distribution:', categoryData);

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#0ea5e9'];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const movementsData = last7Days.map(date => {
    const dayMovements = movements.filter(m => new Date(m.date).toISOString().split('T')[0] === date);
    const entries = dayMovements
      .filter(m => m.type === 'entry')
      .reduce((acc, m) => acc + (m.quantity || 0), 0);
    const exits = dayMovements
      .filter(m => m.type === 'exit')
      .reduce((acc, m) => acc + (m.quantity || 0), 0);
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      entries,
      exits,
    };
  });
  console.log('Movements Data:', movementsData);

  const valueChartData = statistics.categoryValues.map(item => ({
    category: item.category || 'Inconnu',
    value: Math.round(item.value),
  }));
  console.log('Value Chart Data:', valueChartData);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mb-6 flex items-center p-4 bg-red-50 text-red-700 rounded-lg animate-shake">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="ml-4 text-purple-600 hover:text-purple-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 space-y-8">
      <div
        className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold ml-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Insights de Stock
          </h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Produits',
              value: statistics.totalProducts,
              icon: Package,
              change: '+12%',
              gradient: 'from-blue-500 to-indigo-600',
            },
            {
              title: 'Stock Total',
              value: statistics.totalStock,
              icon: Package,
              change: '+8%',
              gradient: 'from-purple-500 to-pink-600',
            },
            {
              title: 'Produits en Alerte',
              value: statistics.lowStockProducts,
              icon: AlertTriangle,
              change: '+3',
              gradient: 'from-orange-500 to-red-600',
            },
            {
              title: 'Valeur Totale',
              value: formatCurrency(statistics.totalValue),
              icon: History,
              change: '+15%',
              gradient: 'from-emerald-500 to-teal-600',
            },
          ].map((metric, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 delay-${index * 100} ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-r opacity-10" />
                <div className="relative">
                  <div className="flex items-center">
                    <div className={`rounded-xl bg-gradient-to-r ${metric.gradient} p-3`}>
                      <metric.icon size={24} className="text-white" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpRight size={16} className="mr-1" />
                      {metric.change}
                    </span>
                    <span className="text-gray-400 ml-2">vs mois dernier</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {[
            {
              title: 'Mouvements de Stock',
              chart: (
                <RechartsAreaChart data={movementsData}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    name="Entrées"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorEntries)"
                  />
                  <Area
                    type="monotone"
                    dataKey="exits"
                    name="Sorties"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorExits)"
                  />
                </RechartsAreaChart>
              ),
            },
            {
              title: 'Distribution par Catégorie',
              chart: (
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              ),
            },
            {
              title: 'Valeur du Stock par Catégorie',
              chart: (
                <RechartsBarChart data={valueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k MAD`} stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="value" name="Valeur">
                    {valueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              ),
            },
            {
              title: 'Tendances du Stock',
              chart: (
                <RechartsLineChart data={movementsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="entries"
                    name="Entrées"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="exits"
                    name="Sorties"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </RechartsLineChart>
              ),
            },
          ].map((chart, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 delay-${(index + 4) * 100} ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{chart.title}</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.chart}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SparkPage;