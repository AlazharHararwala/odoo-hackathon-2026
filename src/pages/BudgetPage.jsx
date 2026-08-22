import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, getTripBudget } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Hotel, 
  Plane, 
  Compass, 
  Utensils,
  Sparkles,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const BudgetPage = () => {
  const navigate = useNavigate();
  const { formatPrice, currencySymbol, t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTripId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Calculate detailed budget metrics
  const calculateBudget = (trip) => {
    if (!trip) return null;

    let transportCost = 0;
    let accommodationCost = 0;
    let activitiesCost = 0;
    let mealsCost = 0;

    (trip.stops || []).forEach((stop) => {
      transportCost += (stop.transportCost || 0);
      accommodationCost += (stop.accommodationCost || 0);
      (stop.activities || []).forEach((act) => {
        if (act.category === 'Food' || act.category === 'Dining') {
          mealsCost += (act.cost || 0);
        } else {
          activitiesCost += (act.cost || 0);
        }
      });
    });

    const total = transportCost + accommodationCost + activitiesCost + mealsCost;
    const targetBudget = trip.targetBudget || 50000;
    const remaining = targetBudget - total;
    const isOverBudget = total > targetBudget;

    const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1 || 1;
    const avgPerDay = Math.round(total / (days > 0 ? days : 1));

    const breakdown = [
      { name: 'Transport', cost: transportCost, color: '#0d9488' },
      { name: 'Accommodation', cost: accommodationCost, color: '#0284c7' },
      { name: 'Activities', cost: activitiesCost, color: '#f59e0b' },
      { name: 'Meals & Dining', cost: mealsCost, color: '#ea580c' },
    ].filter((item) => item.cost > 0);

    const cityBreakdown = (trip.stops || []).map((stop) => {
      const stopActsCost = (stop.activities || []).reduce((acc, act) => acc + (act.cost || 0), 0);
      return {
        name: stop.cityName,
        total: stopActsCost + (stop.accommodationCost || 0) + (stop.transportCost || 0),
        activities: stopActsCost,
        stay: stop.accommodationCost || 0,
      };
    });

    return { total, targetBudget, remaining, isOverBudget, avgPerDay, breakdown, cityBreakdown };
  };

  const budgetData = calculateBudget(selectedTrip);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Trip Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('budgetAnalytics', 'Budget Analytics')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time expenditure tracking, category breakdowns, and financial estimates</p>
        </div>

        {trips.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-600">Select Trip:</span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {(!selectedTrip || !budgetData) ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
          <p className="text-xs font-bold text-slate-500">No active trips available to calculate budget analytics.</p>
        </div>
      ) : (
        <>
          {/* Over-Budget Alert Banner */}
          {budgetData.isOverBudget && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm">Target Budget Exceeded</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Your estimated expenditure of <strong>{formatPrice(budgetData.total)}</strong> exceeds your target limit of <strong>{formatPrice(budgetData.targetBudget)}</strong> by {formatPrice(Math.abs(budgetData.remaining))}. Check the <strong>Can Avoid</strong> tags on activities in your itinerary to stay within budget.
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/itinerary-builder/${selectedTrip.id}`)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 self-start sm:self-center transition-all shadow-xs"
                >
                  Manage Activities
                </button>
              </div>
            </div>
          )}

          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Estimated Cost</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatPrice(budgetData.total)}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">Sum of all stops & activities</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Target Budget Limit</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 text-teal-600">
                {formatPrice(budgetData.targetBudget)}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">Target threshold</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Average Spend / Day</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 text-amber-600">
                {formatPrice(budgetData.avgPerDay)}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">Daily average</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Remaining Budget</span>
              <h3 className={`text-2xl font-black mt-1 ${budgetData.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatPrice(budgetData.remaining)}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {budgetData.remaining >= 0 ? 'Under target budget' : 'Over budget'}
              </span>
            </div>
          </div>

          {/* Breakdown Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Transport</span>
              <span className="text-lg font-bold text-slate-900 block">
                {formatPrice(budgetData.breakdown[0]?.cost || 0)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Hotel className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Accommodation</span>
              <span className="text-lg font-bold text-slate-900 block">
                {formatPrice(budgetData.breakdown[1]?.cost || 0)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Activities</span>
              <span className="text-lg font-bold text-slate-900 block">
                {formatPrice(budgetData.breakdown[2]?.cost || 0)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Meals</span>
              <span className="text-lg font-bold text-slate-900 block">
                {formatPrice(budgetData.breakdown[3]?.cost || 0)}
              </span>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Pie Chart */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900">Spending by Category</h3>
              <div className="h-64">
                {budgetData.breakdown.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No category costs logged</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetData.breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="cost"
                      >
                        {budgetData.breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatPrice(value)} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* City-by-City Expense Comparison */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900">City-by-City Expenditure</h3>
              <div className="h-64">
                {budgetData.cityBreakdown.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No city stop data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData.cityBreakdown}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => formatPrice(val)} />
                      <Tooltip formatter={(val) => formatPrice(val)} />
                      <Legend verticalAlign="bottom" height={36} />
                      <Bar dataKey="activities" name="Activities" fill="#0d9488" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="stay" name="Accommodation" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetPage;
