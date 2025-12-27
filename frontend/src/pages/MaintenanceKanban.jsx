import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchRequests, updateRequestStage, addRequest } from '../store/slices/maintenanceSlice';
import { fetchEquipment } from '../store/slices/equipmentSlice';
import { fetchTechnicians } from '../store/slices/userSlice';
import { Plus, Clock, AlertTriangle, CheckCircle, User, Calendar as CalendarIcon, MoreHorizontal, X, Filter, UserPlus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];

const MaintenanceKanban = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterEquipmentId = searchParams.get('equipmentId');

  const { items: requests, status } = useSelector((state) => state.maintenance);
  const { items: equipmentList } = useSelector((state) => state.equipment);
  const { technicians } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionData, setCompletionData] = useState({ id: null, duration: '' });
  const [assignTechnicianId, setAssignTechnicianId] = useState(null); // Request ID to assign
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const [newRequest, setNewRequest] = useState({
      subject: '',
      equipmentId: '',
      technicianId: '',
      type: 'Corrective',
      description: '',
      priority: 'Medium',
      scheduledDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRequests());
      dispatch(fetchEquipment());
      dispatch(fetchTechnicians());
    }
  }, [status, dispatch]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId;

    // If moving to Repaired, ask for duration
    if (newStage === 'Repaired' && source.droppableId !== 'Repaired') {
        setCompletionData({ id: draggableId, duration: '' });
        setIsCompletionModalOpen(true);
        return;
    }

    dispatch(updateRequestStage({ id: draggableId, stage: newStage }));
  };

  const handleAssignTechnician = (requestId, technicianId) => {
      dispatch(updateRequestStage({ 
          id: requestId, 
          technicianId: parseInt(technicianId)
      }));
      setAssignTechnicianId(null);
      setSelectedTechnician('');
  };

  const handleCompletionSubmit = (e) => {
      e.preventDefault();
      if (completionData.id) {
          dispatch(updateRequestStage({ 
              id: parseInt(completionData.id), 
              stage: 'Repaired', 
              duration: parseFloat(completionData.duration) || 0 
          }));
          setIsCompletionModalOpen(false);
          setCompletionData({ id: null, duration: '' });
      }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewRequest({ ...newRequest, [name]: value });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      dispatch(addRequest(newRequest));
      setIsModalOpen(false);
      setNewRequest({
          subject: '',
          equipmentId: '',
          technicianId: '',
          type: 'Corrective',
          description: '',
          priority: 'Medium',
          scheduledDate: new Date().toISOString().split('T')[0]
  });
  };

  const getRequestsByStage = (stage) => {
    let filtered = requests;
    if (filterEquipmentId) {
        filtered = filtered.filter(req => req.equipmentId === parseInt(filterEquipmentId));
    }
    return filtered.filter((req) => req.stage === stage);
  };

  const clearFilter = () => {
      setSearchParams({});
  };

  const isOverdue = (dateString, stage) => {
      if (!dateString || stage === 'Repaired' || stage === 'Scrap') return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      return new Date(dateString) < today;
  };

  const getPriorityColor = (priority) => {
      switch(priority) {
          case 'High': return 'bg-red-500';
          case 'Medium': return 'bg-orange-400';
          case 'Low': return 'bg-green-500';
          default: return 'bg-gray-400';
      }
  };

  const getPriorityBadge = (priority) => {
      switch(priority) {
          case 'High': return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider">High</span>;
          case 'Medium': return <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Medium</span>;
          case 'Low': return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Low</span>;
          default: return null;
      }
  };

  if (status === 'loading') {
      return (
          <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Maintenance Board</h2>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">Track repair status and schedule.</p>
                    {filterEquipmentId && (
                         <span className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            <Filter className="h-3 w-3" />
                            Filtered by Asset
                            <button onClick={clearFilter} className="ml-1 hover:text-purple-900">
                                <X className="h-3 w-3" />
                            </button>
                         </span>
                    )}
                </div>
            </div>
             <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">New Request</span>
                <span className="sm:hidden">New</span>
            </button>
        </div>
      
      <div className="flex-grow overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-6 min-w-max h-full">
            {stages.map((stage) => (
                <Droppable key={stage} droppableId={stage}>
                {(provided) => (
                    <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100/80 rounded-xl p-3 w-80 flex flex-col max-h-[calc(100vh-12rem)]"
                    >
                    <div className="flex items-center justify-between mb-3 px-1">
                         <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stage}</h3>
                         <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                             {getRequestsByStage(stage).length}
                         </span>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto space-y-3 px-1">
                        {getRequestsByStage(stage).map((request, index) => (
                            <Draggable key={request.id.toString()} draggableId={request.id.toString()} index={index}>
                            {(provided, snapshot) => (
                                <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2 ring-2 ring-purple-400' : ''}`}
                                >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug">{request.subject}</h4>
                                    {getPriorityBadge(request.priority)}
                                </div>
                                
                                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                    <span className="truncate max-w-[150px]">{request.Equipment ? request.Equipment.name : 'Unknown Asset'}</span>
                                </p>

                                <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-2">
                                    <div className="flex items-center gap-2 relative">
                                        {/* Avatar / Assign Button */}
                                        {request.technician ? (
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm" title={request.technician.name}>
                                                {request.technician.name.charAt(0)}
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAssignTechnicianId(request.id);
                                                }}
                                                className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                                                title="Assign Technician"
                                            >
                                                <UserPlus className="h-3 w-3" />
                                            </button>
                                        )}
                                        
                                        {/* Quick Assign Dropdown */}
                                        {assignTechnicianId === request.id && (
                                            <div className="absolute top-8 left-0 bg-white shadow-xl border border-gray-200 rounded-lg p-2 z-50 w-48 animate-in fade-in zoom-in duration-200">
                                                <div className="flex justify-between items-center mb-2 px-1">
                                                    <span className="text-xs font-semibold text-gray-700">Assign to:</span>
                                                    <button onClick={() => setAssignTechnicianId(null)}><X className="h-3 w-3 text-gray-400" /></button>
                                                </div>
                                                <div className="max-h-32 overflow-y-auto space-y-1">
                                                    {technicians.map(tech => (
                                                        <button
                                                            key={tech.id}
                                                            onClick={() => handleAssignTechnician(request.id, tech.id)}
                                                            className="w-full text-left text-xs px-2 py-1.5 hover:bg-purple-50 rounded text-gray-700 flex items-center gap-2"
                                                        >
                                                            <div className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">
                                                                {tech.name.charAt(0)}
                                                            </div>
                                                            {tech.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${request.type === 'Preventive' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                            {request.type === 'Preventive' ? 'Prev' : 'Corr'}
                                        </span>
                                        {isOverdue(request.scheduledDate, stage) && (
                                            <span className="flex items-center text-xs text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                                                <Clock className="h-3 w-3 mr-1" /> Overdue
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                         {/* Date Indicator if needed */}
                                    </div>
                                </div>
                                {isOverdue(request.scheduledDate, stage) && (
                                    <div className="h-1 w-full bg-red-500 rounded-b-lg absolute bottom-0 left-0"></div>
                                )}
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                    {/* Add quick add button at bottom of column could go here */}
                    </div>
                )}
                </Droppable>
            ))}
            </div>
        </DragDropContext>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">New Request</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={newRequest.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Equipment</label>
                        <select
                            name="equipmentId"
                            value={newRequest.equipmentId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                        >
                            <option value="">Select Equipment</option>
                            {equipmentList.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Assign Technician (Optional)</label>
                        <select
                            name="technicianId"
                            value={newRequest.technicianId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                            <option value="">Unassigned</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="Corrective"
                                    checked={newRequest.type === 'Corrective'}
                                    onChange={handleInputChange}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700 text-sm">Corrective</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="Preventive"
                                    checked={newRequest.type === 'Preventive'}
                                    onChange={handleInputChange}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700 text-sm">Preventive</span>
                            </label>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Priority</label>
                             <select
                                name="priority"
                                value={newRequest.priority}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-gray-700 text-sm font-semibold mb-1">Scheduled Date</label>
                             <input
                                type="date"
                                name="scheduledDate"
                                value={newRequest.scheduledDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={newRequest.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            placeholder="Describe the issue..."
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Technician (Optional)</label>
                        <select
                            name="technicianId"
                            value={newRequest.technicianId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                            <option value="">Auto-assign (Default)</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Technician (Optional)</label>
                        <select
                            name="technicianId"
                            value={newRequest.technicianId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                            <option value="">Auto-assign (Default)</option>
                            {technicians && technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
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
                            Create Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      {isCompletionModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Complete Repair</h3>
                    <button onClick={() => setIsCompletionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleCompletionSubmit} className="p-6 space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                        Please record the time spent on this repair before marking it as complete.
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Duration (Hours)</label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={completionData.duration}
                            onChange={(e) => setCompletionData({...completionData, duration: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                            placeholder="e.g. 2.5"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCompletionModalOpen(false)}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                        >
                            Mark Repaired
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceKanban;
