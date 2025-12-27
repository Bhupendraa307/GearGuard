import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipment, addEquipment, fetchEquipmentById } from '../store/slices/equipmentSlice';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Wrench, MapPin, Briefcase, Activity, MoreHorizontal, X, Package } from 'lucide-react';

const EquipmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: equipment, status, error, currentItem } = useSelector((state) => state.equipment);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('All'); // 'All', 'Department', 'Location'
  
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    serialNumber: '',
    location: '',
    department: '',
    category: '',
    purchaseDate: '',
    warrantyExpiration: ''
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchEquipment());
    }
  }, [status, dispatch]);

  const handleViewDetails = (id) => {
      dispatch(fetchEquipmentById(id));
      setIsDetailModalOpen(true);
  };

  const handleMaintenanceClick = () => {
      if (currentItem) {
        navigate(`/kanban?equipmentId=${currentItem.id}`);
      }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment({ ...newEquipment, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addEquipment(newEquipment));
    setIsModalOpen(false);
    setNewEquipment({
        name: '',
        serialNumber: '',
        location: '',
        department: '',
        category: '',
        purchaseDate: '',
        warrantyExpiration: '',
    });
  };

  // Filter Logic
  const filteredEquipment = equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
  });

  if (status === 'loading') {
    return (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    );
  }

  if (status === 'failed') {
    return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">Error: {error}</p>
        </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Equipment Assets</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and track company assets.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-grow sm:flex-grow-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search assets..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Equipment</span>
            <span className="sm:hidden">Add</span>
            </button>
        </div>
      </div>

      {/* Grid View */}
      {filteredEquipment.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new asset.</p>
          </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredEquipment.map((item) => (
          <div key={item.id} className="bg-white group rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
            <div className="p-5 flex-grow">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs font-mono text-gray-500 mt-1 bg-gray-100 inline-block px-1 rounded">{item.serialNumber}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'Operational' ? 'bg-green-100 text-green-800' : 
                    item.status === 'Down' ? 'bg-red-100 text-red-800' : 
                    item.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                 }`}>
                    {item.status}
                 </span>
              </div>
              
              <div className="mt-4 space-y-2">
                 <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {item.location || 'Unassigned'}
                 </div>
                 <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    {item.department || 'General'}
                 </div>
                 <div className="flex items-center text-sm text-gray-600">
                    <Activity className="h-4 w-4 mr-2 text-gray-400" />
                    {item.category || 'Uncategorized'}
                 </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-xl flex justify-between items-center">
                <span className="text-xs text-gray-500">Technician: <span className="font-medium text-gray-700">{item.assignedTechnician ? item.assignedTechnician.name : 'Auto-assign'}</span></span>
                 <button
                   onClick={() => handleViewDetails(item.id)}
                   className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors"
               >
                   Details &rarr;
               </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Add New Equipment</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newEquipment.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={newEquipment.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newEquipment.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                   <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={newEquipment.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
               </div>
               <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={newEquipment.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
       {isDetailModalOpen && currentItem && (
           <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all overflow-hidden">
             {/* Modal Header */}
             <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                 <div>
                    <h3 className="text-xl font-bold text-gray-900">{currentItem.name}</h3>
                    <p className="text-sm text-gray-500 font-mono mt-1">{currentItem.serialNumber}</p>
                 </div>
                 <div className="flex items-center gap-4">
                     {/* Smart Button */}
                     <button 
                        onClick={handleMaintenanceClick}
                        className="flex flex-col items-center bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-200 text-gray-700 hover:text-purple-700 px-4 py-2 rounded-lg transition-all shadow-sm group"
                     >
                        <div className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-bold">{currentItem.openRequestsCount || 0}</span>
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wide">Maintenance</span>
                     </button>
                     
                     <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                     </button>
                 </div>
             </div>
             
             <div className="p-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                         <div className="space-y-1">
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Purchase Date</p>
                             <p className="text-base text-gray-900 font-medium">
                                 {currentItem.purchaseDate ? new Date(currentItem.purchaseDate).toLocaleDateString() : 'N/A'}
                             </p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Warranty Expiration</p>
                             <p className="text-base text-gray-900 font-medium">
                                 {currentItem.warrantyExpiration ? new Date(currentItem.warrantyExpiration).toLocaleDateString() : 'N/A'}
                             </p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Location</p>
                             <p className="text-base text-gray-900 font-medium flex items-center gap-2">
                                 <MapPin className="h-4 w-4 text-gray-400" /> {currentItem.location || 'N/A'}
                             </p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Department</p>
                             <p className="text-base text-gray-900 font-medium flex items-center gap-2">
                                 <Briefcase className="h-4 w-4 text-gray-400" /> {currentItem.department || 'N/A'}
                             </p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Category</p>
                             <p className="text-base text-gray-900 font-medium flex items-center gap-2">
                                 <Activity className="h-4 w-4 text-gray-400" /> {currentItem.category || 'N/A'}
                             </p>
                         </div>
                          <div className="space-y-1">
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Warranty Expiration</p>
                             <p className="text-base text-gray-900 font-medium">{currentItem.warrantyExpiration || 'No Warranty Info'}</p>
                         </div>
                     </div>
                 </div>

                 <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
                     <button
                         type="button"
                         onClick={() => setIsDetailModalOpen(false)}
                         className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                     >
                         Close
                     </button>
                 </div>
             </div>
           </div>
       )}
    </div>
  );
};

export default EquipmentList;
