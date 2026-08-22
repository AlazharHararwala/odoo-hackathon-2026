import React, { useState, useEffect } from 'react';
import { getTrips, getTripBudget } from '../services/api';
import { useToast } from '../context/ToastContext';
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
  Utensils 
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
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripsList();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchBudgetForTrip(selectedTripId);
    }
  }, [selectedTripId]);

  const fetchTripsList = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTripId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBudgetForTrip = async (tripId) => {
    setLoading(true);
    try {
      const data = await getTripBudget(tripId);
      setBudgetData(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading budget analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#ea580c'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Trip Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trip Budget Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Visualize expenses, category breakdowns, and stay within target limits</p>
        </div>

        {trips.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.startDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading || !budgetData ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Calculating financial analytics...</p>
        </div>
      ) : (
        <>
          {/* Over-Budget Alert Banner */}
          {budgetData.isOverBudget && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Target Budget Exceeded</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Your estimated trip expenditure of <strong>₹{budgetData.total.toLocaleString('en-IN')}</strong> exceeds your target limit of <strong>₹{budgetData.targetBudget.toLocaleString('en-IN')}</strong> by ₹{Math.abs(budgetData.remaining).toLocaleString('en-IN')}. Consider revising activity or transport costs.
                </p>
              </div>
            </div>
          )}

          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Estimated Cost</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center">
                <IndianRupee className="w-5 h-5 text-primary-600" />
                {budgetData.total.toLocaleString('en-IN')}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">Sum of all stops & activities</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Target Budget Limit</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center">
                <IndianRupee className="w-5 h-5 text-teal-600" />
                {budgetData.targetBudget.toLocaleString('en-IN')}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">Target threshold</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Average Spend / Day</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center">
                <IndianRupee className="w-5 h-5 text-amber-600" />
                {budgetData.avgPerDay.toLocaleString('en-IN')}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">Daily average</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Remaining Budget</span>
              <h3 className={`text-2xl font-black mt-1 flex items-center ${budgetData.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                <IndianRupee className="w-5 h-5" />
                {budgetData.remaining.toLocaleString('en-IN')}
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
                ₹{(budgetData.breakdown[0]?.cost || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Hotel className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Accommodation</span>
              <span className="text-lg font-bold text-slate-900 block">
                ₹{(budgetData.breakdown[1]?.cost || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Activities</span>
              <span className="text-lg font-bold text-slate-900 block">
                ₹{(budgetData.breakdown[2]?.cost || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-500 font-semibold block">Meals</span>
              <span className="text-lg font-bold text-slate-900 block">
                ₹{(budgetData.breakdown[3]?.cost || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart: Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Cost by Category</h3>
                  <p className="text-xs text-slate-500">Distribution of planned travel expenses</p>
                </div>
                <PieIcon className="w-5 h-5 text-slate-400" />
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData.breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="cost"
                    >
                      {budgetData.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Cost by City */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Cost by City Stop</h3>
                  <p className="text-xs text-slate-500 font-normal">Comparative expenses across destinations</p>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData.cityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="accommodation" fill="#0284c7" name="Hotel" stackId="a" />
                    <Bar dataKey="transport" fill="#0d9488" name="Transport" stackId="a" />
                    <Bar dataKey="activities" fill="#f59e0b" name="Activities" stackId="a" />
                    <Bar dataKey="meals" fill="#ea580c" name="Meals" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetPage;
