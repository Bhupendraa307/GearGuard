import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, addRequest } from '../store/slices/maintenanceSlice';
import { fetchEquipment } from '../store/slices/equipmentSlice';
import { X } from 'lucide-react';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const dispatch = useDispatch();
  const { items: requests, status } = useSelector((state) => state.maintenance);
  const { items: equipmentList } = useSelector((state) => state.equipment);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newPreventiveRequest, setNewPreventiveRequest] = useState({
      subject: '',
      equipmentId: '',
      priority: 'Medium',
      description: '',
      scheduledDate: new Date()
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRequests());
      dispatch(fetchEquipment());
    }
  }, [status, dispatch]);

  const events = requests
    .filter(req => req.type === 'Preventive' && req.scheduledDate)
    .map(req => ({
      id: req.id,
      title: `${req.subject} - ${req.Equipment ? req.Equipment.name : ''}`,
      start: new Date(req.scheduledDate),
      end: new Date(req.scheduledDate), // Assuming 1 day or specified duration
      allDay: true,
      resource: req
    }));

  const handleSelectSlot = ({ start }) => {
      setSelectedDate(start);
      setNewPreventiveRequest({ 
          ...newPreventiveRequest, 
          scheduledDate: start,
          priority: 'Medium',
          description: ''
      });
      setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewPreventiveRequest({ ...newPreventiveRequest, [name]: value });
  };

   const handleSubmit = (e) => {
      e.preventDefault();
      dispatch(addRequest({
          ...newPreventiveRequest,
          type: 'Preventive'
      }));
      setIsModalOpen(false);
      setNewPreventiveRequest({
          subject: '',
          equipmentId: '',
          priority: 'Medium',
          description: '',
          scheduledDate: new Date()
      });
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = '#9333ea'; // purple-600
    if (event.resource.priority === 'High') backgroundColor = '#ef4444'; // red-500
    if (event.resource.priority === 'Low') backgroundColor = '#22c55e'; // green-500
    
    return {
        style: {
            backgroundColor: backgroundColor,
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        }
    };
  };

  if (status === 'loading') {
      return (
          <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Maintenance Calendar</h2>
            <p className="text-sm text-gray-500 mt-1">Schedule and view preventive maintenance.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
             <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-red-500"></span> High
             </div>
             <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-purple-600"></span> Medium
             </div>
             <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-green-500"></span> Low
             </div>
        </div>
      </div>
      
      <div className="h-[600px] font-sans">
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            selectable
            onSelectSlot={handleSelectSlot}
            views={['month', 'week', 'day']}
            eventPropGetter={eventStyleGetter}
            className="rounded-lg overflow-hidden"
        />
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Schedule Maintenance</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="mb-6 text-sm text-purple-600 font-medium bg-purple-50 p-2 rounded inline-block">
                        Date: {moment(selectedDate).format('LL')}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={newPreventiveRequest.subject}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Equipment</label>
                            <select
                                name="equipmentId"
                                value={newPreventiveRequest.equipmentId}
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
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Priority</label>
                            <select
                                name="priority"
                                value={newPreventiveRequest.priority}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Description</label>
                            <textarea
                                name="description"
                                value={newPreventiveRequest.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                placeholder="Details about the preventive maintenance..."
                            ></textarea>
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
                                Schedule
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
