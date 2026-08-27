import { useState, useMemo } from 'react';
import { useGetContactsQuery } from '../store/apiSlice';
import { Loader2, ChevronLeft, ChevronRight, Mail, Phone, Calendar, User as UserIcon, Inbox } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const SupportMessages = () => {
  const [page, setPage] = useState(1);
  const limit = 20; // Fetch more for inbox style
  const { data, isLoading } = useGetContactsQuery({ page, limit });
  const contacts = data?.data?.contacts || [];
  const totalPages = data?.data?.totalPages || 1;
  const total = data?.data?.total || 0;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first message when data loads if nothing is selected
  useMemo(() => {
    if (contacts.length > 0 && !selectedId) {
      setSelectedId(contacts[0].id);
    }
  }, [contacts, selectedId]);

  const selectedMessage = contacts.find((c: any) => c.id === selectedId) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3CCFBD]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} total messages
          </p>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs font-medium text-gray-500 mr-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); setSelectedId(null); }}
              disabled={page === 1}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setSelectedId(null); }}
              disabled={page === totalPages}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex min-h-[500px]">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 space-y-4">
            <Inbox className="w-16 h-16 text-gray-200" />
            <p className="text-lg font-medium text-gray-500">No support messages yet.</p>
          </div>
        ) : (
          <>
            {/* Left Pane: Message List */}
            <div className="w-full md:w-2/5 lg:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
              <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                {contacts.map((contact: any) => {
                  const isSelected = selectedId === contact.id;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedId(contact.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                        isSelected 
                          ? 'bg-white border-[#3CCFBD]/30 shadow-[0_4px_20px_rgba(60,207,189,0.08)] ring-1 ring-[#3CCFBD]/10' 
                          : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-[#0a192f]' : 'text-gray-900'}`}>
                          {contact.full_name}
                        </span>
                        <span className={`text-[11px] shrink-0 font-medium ${isSelected ? 'text-[#3CCFBD]' : 'text-gray-400'}`}>
                          {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2 truncate font-medium">
                        {contact.email}
                      </div>
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                        {contact.message}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Message Detail */}
            <div className="hidden md:flex flex-col w-3/5 lg:w-2/3 bg-white">
              {selectedMessage ? (
                <div className="flex-1 flex flex-col h-full">
                  {/* Detail Header */}
                  <div className="px-8 py-6 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#bef264]/20 to-[#3CCFBD]/20 border border-[#3CCFBD]/20 flex items-center justify-center shrink-0">
                          <span className="text-[#0a192f] font-bold text-lg">
                            {selectedMessage.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedMessage.full_name}</h2>
                          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                            <span className="flex items-center hover:text-[#3CCFBD] transition-colors cursor-pointer">
                              <Mail className="w-4 h-4 mr-1.5" />
                              <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                            </span>
                            {selectedMessage.phone && (
                              <span className="flex items-center hover:text-[#3CCFBD] transition-colors cursor-pointer">
                                <Phone className="w-4 h-4 mr-1.5" />
                                <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-400 flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detail Body */}
                  <div className="p-8 overflow-y-auto flex-1 bg-[#FAFAFA]/50 custom-scrollbar">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 bg-gray-50/50">
                  <Mail className="w-16 h-16 text-gray-200" />
                  <p className="text-sm font-medium">Select a message to read</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportMessages;
