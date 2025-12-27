import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests } from '../store/slices/maintenanceSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const Reporting = () => {
  const dispatch = useDispatch();
  const { items: requests, status } = useSelector((state) => state.maintenance);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRequests());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    );
  }

  // --- Aggregation Logic ---

  // 1. Requests by Team
  const teamDataMap = {};
  requests.forEach(req => {
      const teamName = req.Team ? req.Team.name : 'Unassigned';
      teamDataMap[teamName] = (teamDataMap[teamName] || 0) + 1;
  });
  const teamData = Object.keys(teamDataMap).map(name => ({ name, count: teamDataMap[name] }));

  // 2. Requests by Category
  const categoryDataMap = {};
  requests.forEach(req => {
      const category = req.Equipment ? req.Equipment.category : 'Unknown';
      categoryDataMap[category] = (categoryDataMap[category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryDataMap).map(name => ({ name, value: categoryDataMap[name] }));

  // 3. KPIs
  const totalRequests = requests.length;
  const openRequests = requests.filter(r => r.stage !== 'Repaired' && r.stage !== 'Scrap').length;
  const repairedRequests = requests.filter(r => r.stage === 'Repaired');
  const avgDuration = repairedRequests.length > 0 
      ? (repairedRequests.reduce((acc, r) => acc + (r.duration || 0), 0) / repairedRequests.length).toFixed(1) 
      : 0;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Maintenance Reporting</h2>
        <p className="text-sm text-gray-500 mt-1">Insights and performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <Activity className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Requests</p>
                <h4 className="text-2xl font-bold text-gray-900">{totalRequests}</h4>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Open Requests</p>
                <h4 className="text-2xl font-bold text-gray-900">{openRequests}</h4>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <Clock className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Repair Time</p>
                <h4 className="text-2xl font-bold text-gray-900">{avgDuration} hrs</h4>
            </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Requests per Team */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests per Team</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Pie Chart: Requests per Category */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Reporting;
