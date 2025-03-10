import React, { useEffect, useRef } from 'react';
import { useLocationStore, EmergencyRequest } from '../lib/store';
import Button from './Button';

const MessageCenter = () => {
  const { selectedRequest, newMessage, setNewMessage, sendMessage, isDriverMode } = useLocationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedRequest?.messages]);

  if (!selectedRequest) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(selectedRequest.id, newMessage);
    }
  };

  const renderRequestStatus = (request: EmergencyRequest) => {
    switch (request.status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Waiting for help</span>;
      case 'accepted':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Help on the way</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <h2 className="text-lg font-medium">{isDriverMode ? selectedRequest.userName : 'Emergency Support'}</h2>
            <div className="ml-2">{renderRequestStatus(selectedRequest)}</div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{selectedRequest.type}</p>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => useLocationStore.getState().selectRequest(null)}
            className="text-sm"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-3">
          {selectedRequest.messages.map((message) => (
            <div key={message.id} className={`flex ${message.isDriver === isDriverMode ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.isDriver === isDriverMode 
                  ? 'bg-primary-600 text-white' 
                  : message.senderId === 'system'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                <div className="text-xs mb-1">
                  {message.senderId === 'system' ? 'System' : (message.isDriver ? 'Driver' : selectedRequest.userName)}
                  <span className="ml-2 opacity-70">{formatTime(message.timestamp)}</span>
                </div>
                <div>{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {(selectedRequest.status === 'accepted' || selectedRequest.status === 'pending') && (
        <div className="p-3 border-t">
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type a message..."
            />
            <button 
              type="submit" 
              className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Action Buttons */}
      {selectedRequest.status === 'accepted' && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex justify-between">
            {isDriverMode ? (
              <Button
                variant="primary"
                onClick={() => useLocationStore.getState().completeRequest(selectedRequest.id)}
                fullWidth
              >
                Complete Service
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => useLocationStore.getState().cancelRequest(selectedRequest.id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {selectedRequest.status === 'pending' && isDriverMode && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex justify-between space-x-2">
            <Button
              variant="outline"
              onClick={() => useLocationStore.getState().rejectRequest(selectedRequest.id)}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => useLocationStore.getState().acceptRequest(selectedRequest.id)}
            >
              Accept Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCenter; 