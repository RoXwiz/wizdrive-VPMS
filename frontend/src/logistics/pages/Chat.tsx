import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Search, User, Menu, Heart } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  read: boolean;
  reactions?: { [key: string]: string[] };
}

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Japan Auto Parts Co.',
      role: 'Seller',
      lastMessage: 'The shipment will be ready by tomorrow',
      timestamp: '10:30 AM',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'China Parts Manufacturing',
      role: 'Seller',
      lastMessage: 'Please confirm the order details',
      timestamp: '9:15 AM',
      unread: 0,
      online: false,
    },
    {
      id: '3',
      name: 'Sri Lanka Motors Ltd',
      role: 'Buyer',
      lastMessage: 'When will the parts arrive?',
      timestamp: 'Yesterday',
      unread: 1,
      online: true,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Japan Auto Parts Co.',
      content: 'Hello! How can we help you today?',
      timestamp: '10:30 AM',
      isMe: false,
      read: true,
      reactions: { '❤️': ['Me'] },
    },
    {
      id: '2',
      sender: 'Me',
      content: 'Hi, I need to check the status of order #WD123',
      timestamp: '10:31 AM',
      isMe: true,
      read: true,
    },
    {
      id: '3',
      sender: 'Japan Auto Parts Co.',
      content: 'Let me check that for you right away.',
      timestamp: '10:32 AM',
      isMe: false,
      read: false,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const moveContactToTop = (contactId: string) => {
    setContacts((prevContacts) => {
      const contactIndex = prevContacts.findIndex((c) => c.id === contactId);
      if (contactIndex === -1) return prevContacts;
      const contact = prevContacts[contactIndex];
      return [contact, ...prevContacts.slice(0, contactIndex), ...prevContacts.slice(contactIndex + 1)];
    });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'Me',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      read: false,
    };

    setMessages([...messages, newMessage]);
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: message, timestamp: newMessage.timestamp, unread: 0 }
          : c
      )
    );
    moveContactToTop(selectedContact.id);
    setMessage('');
    setShowEmoji(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: msg.reactions?.[emoji] ? [...msg.reactions[emoji], 'Me'] : ['Me'],
              },
            }
          : msg
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContact) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'Me',
        content: `Attached: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        read: false,
      };
      setMessages([...messages, newMessage]);
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c.id === selectedContact.id
            ? { ...c, lastMessage: newMessage.content, timestamp: newMessage.timestamp, unread: 0 }
            : c
        )
      );
      moveContactToTop(selectedContact.id);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(messageSearch.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto h-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
      >
        {/* Mobile Sidebar Toggle */}
        <button
          className="md:hidden p-4 bg-blue-500 text-white"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Contacts Sidebar */}
        <AnimatePresence>
          {(showSidebar || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-full md:w-80 border-r bg-white absolute md:static z-10 h-full md:h-auto"
            >
              <div className="p-4 border-b">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100%-5rem)]">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowSidebar(false);
                    }}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          {contact.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{contact.name}</h3>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        </div>
                      </div>
                      {contact.unread > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 truncate">{contact.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{contact.timestamp}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      {selectedContact.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-900">{selectedContact.name}</h2>
                      <p className="text-sm text-gray-500">{selectedContact.role}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={messageSearch}
                      onChange={(e) => setMessageSearch(e.target.value)}
                      className="pl-10 pr-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 relative group ${
                        msg.isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-xs ${
                            msg.isMe ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                        {msg.isMe && (
                          <span className="text-xs text-blue-100">
                            {msg.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                      {msg.reactions && (
                        <div className="flex space-x-1 mt-1">
                          {Object.keys(msg.reactions).map((emoji) => (
                            <span key={emoji} className="text-sm">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => addReaction(msg.id, '❤️')}
                        className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full pl-4 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <label className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
                      <Paperclip className="h-5 w-5" />
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                      onClick={handleSendMessage}
                      className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  {showEmoji && (
                    <div className="absolute bottom-12 right-0 z-10">
                      <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-600">
                  Select a contact to start chatting
                </h2>
                <p className="text-gray-500 mt-2">
                  Choose from your contacts on the left
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;