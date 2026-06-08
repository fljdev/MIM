import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface DashboardData {
  totalHoldings: number;
  totalWeight: number;
  totalCrypto: number;
  totalCash: number;
  recentActivity: { type: string; name: string; date: string }[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

        const [holdingsRes, cryptoRes, cashRes] = await Promise.all([
          fetch(`${baseUrl}/api/holdings?user_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseUrl}/api/crypto?user_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseUrl}/api/cash?user_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const holdings = holdingsRes.ok ? await holdingsRes.json() : [];
        const crypto = cryptoRes.ok ? await cryptoRes.json() : [];
        const cash = cashRes.ok ? await cashRes.json() : [];

        const totalWeight = holdings.reduce((sum: number, h: any) => sum + Number(h.weight_grams), 0);
        const recent = [
          ...holdings.slice(0, 3).map((h: any) => ({ type: 'Metal', name: h.name, date: h.created_at })),
          ...crypto.slice(0, 3).map((c: any) => ({ type: 'Crypto', name: c.coin_name, date: c.created_at })),
          ...cash.slice(0, 3).map((c: any) => ({ type: 'Cash', name: c.label, date: c.created_at })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        setData({
          totalHoldings: holdings.length,
          totalWeight,
          totalCrypto: crypto.length,
          totalCash: cash.length,
          recentActivity: recent,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };

    if (user.id) fetchDashboard();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Welcome, {user.name || 'Investor'}</h1>
        <p className="text-amber-700 mb-8">Your portfolio at a glance</p>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🥇</div>
            <p className="text-2xl font-bold text-amber-900">{data?.totalHoldings ?? '—'}</p>
            <p className="text-amber-600">Metal Holdings</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">⚖️</div>
            <p className="text-2xl font-bold text-amber-900">{data?.totalWeight ? `${data.totalWeight}g` : '—'}</p>
            <p className="text-amber-600">Total Weight</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">₿</div>
            <p className="text-2xl font-bold text-amber-900">{data?.totalCrypto ?? '—'}</p>
            <p className="text-amber-600">Crypto Assets</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">💶</div>
            <p className="text-2xl font-bold text-amber-900">{data?.totalCash ?? '—'}</p>
            <p className="text-amber-600">Cash Holdings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/portfolio" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-semibold text-amber-900 mb-2">View Portfolio</h2>
            <p className="text-amber-700">Browse all your precious metals holdings</p>
          </Link>
          <Link to="/add-holding" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-semibold text-amber-900 mb-2">Add Holding</h2>
            <p className="text-amber-700">Record a new gold, silver, or platinum asset</p>
          </Link>
        </div>

        {data && data.recentActivity.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {data.recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-amber-700">
                  <span className="px-2 py-1 bg-amber-100 rounded text-xs font-semibold">{item.type}</span>
                  <span>{item.name}</span>
                  <span className="text-xs text-amber-400 ml-auto">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
