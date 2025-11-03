import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  subject: string
  content: string
  created_at: string
  is_read: boolean
  sender: {
    first_name: string
    last_name: string
    role: string
  }
  recipient: {
    first_name: string
    last_name: string
    role: string
  }
}

interface Recipient {
  id: string
  profile_id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

export const MessagingInterface = () => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<'inbox' | 'sent' | 'compose'>('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [recipients, setRecipients] = useState<Recipient[]>([])

  useEffect(() => {
    if (activeView === 'inbox') {
      fetchInboxMessages()
    } else if (activeView === 'sent') {
      fetchSentMessages()
    } else if (activeView === 'compose') {
      fetchRecipients()
    }
  }, [activeView, user])

  const fetchInboxMessages = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, role),
          recipient:recipient_id(first_name, last_name, role)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching inbox:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSentMessages = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, role),
          recipient:recipient_id(first_name, last_name, role)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching sent messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    if (!user) return

    try {
      // Get all profiles except current user
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .neq('id', user.id)
        .order('first_name')

      // Map data to include profile_id (same as id for profiles table)
      const mappedRecipients = data?.map(profile => ({
        ...profile,
        profile_id: profile.id
      })) || []

      setRecipients(mappedRecipients)
    } catch (error) {
      console.error('Error fetching recipients:', error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message)
    if (!message.is_read && activeView === 'inbox') {
      markAsRead(message.id)
    }
  }

  const handleBackToList = () => {
    setSelectedMessage(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <button
          onClick={() => {
            setActiveView('compose')
            setSelectedMessage(null)
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Compose Message
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => {
                setActiveView('inbox')
                setSelectedMessage(null)
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'inbox'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => {
                setActiveView('sent')
                setSelectedMessage(null)
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'sent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent
            </button>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6">
          {activeView === 'compose' ? (
            <ComposeMessage
              recipients={recipients}
              onCancel={() => setActiveView('inbox')}
              onSuccess={() => {
                setActiveView('sent')
                fetchSentMessages()
              }}
            />
          ) : selectedMessage ? (
            <MessageDetail
              message={selectedMessage}
              onBack={handleBackToList}
              isInbox={activeView === 'inbox'}
            />
          ) : (
            <MessageList
              messages={messages}
              loading={loading}
              onMessageClick={handleMessageClick}
              isInbox={activeView === 'inbox'}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: Message[]
  loading: boolean
  onMessageClick: (message: Message) => void
  isInbox: boolean
}

const MessageList = ({ messages, loading, onMessageClick, isInbox }: MessageListProps) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading messages...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No messages found</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {messages.map(message => (
        <div
          key={message.id}
          onClick={() => onMessageClick(message)}
          className={`p-4 hover:bg-gray-50 cursor-pointer ${
            !message.is_read && isInbox ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {!message.is_read && isInbox && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
                <span className={`text-sm ${!message.is_read && isInbox ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                  {isInbox 
                    ? `${message.sender.first_name} ${message.sender.last_name}`
                    : `To: ${message.recipient.first_name} ${message.recipient.last_name}`
                  }
                </span>
                <span className="text-xs text-gray-500">
                  ({isInbox ? message.sender.role : message.recipient.role})
                </span>
              </div>
              <h4 className={`mt-1 text-sm ${!message.is_read && isInbox ? 'font-semibold' : ''} text-gray-900`}>
                {message.subject}
              </h4>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {message.content}
              </p>
            </div>
            <span className="text-xs text-gray-500 ml-4">
              {new Date(message.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface MessageDetailProps {
  message: Message
  onBack: () => void
  isInbox: boolean
}

const MessageDetail = ({ message, onBack, isInbox }: MessageDetailProps) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </button>

      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">{message.subject}</h3>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">
              {isInbox ? 'From' : 'To'}:
            </span>{' '}
            {isInbox 
              ? `${message.sender.first_name} ${message.sender.last_name} (${message.sender.role})`
              : `${message.recipient.first_name} ${message.recipient.last_name} (${message.recipient.role})`
            }
          </div>
          <span>{new Date(message.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

interface ComposeMessageProps {
  recipients: Recipient[]
  onCancel: () => void
  onSuccess: () => void
}

const ComposeMessage = ({ recipients, onCancel, onSuccess }: ComposeMessageProps) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    content: '',
  })
  const [sending, setSending] = useState(false)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Message templates
  const templates = [
    {
      name: 'Meeting Request',
      subject: 'Meeting Request',
      content: 'Dear [Name],\n\nI would like to schedule a meeting to discuss...\n\nBest regards'
    },
    {
      name: 'Progress Update',
      subject: 'Student Progress Update',
      content: 'Dear Parent/Guardian,\n\nI wanted to update you on your child\'s progress...\n\nBest regards'
    },
    {
      name: 'Assignment Reminder',
      subject: 'Assignment Reminder',
      content: 'Dear Student,\n\nThis is a reminder about the upcoming assignment...\n\nBest regards'
    },
  ]

  const filteredRecipients = recipients.filter(r => {
    const matchesRole = filterRole === 'all' || r.role === filterRole
    const matchesSearch = searchTerm === '' || 
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          recipient_id: formData.recipient_id,
          subject: formData.subject,
          content: formData.content,
        }])

      if (error) throw error

      alert('Message sent successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('Error sending message:', error)
      alert(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Templates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Templates
        </label>
        <div className="flex flex-wrap gap-2">
          {templates.map(template => (
            <button
              key={template.name}
              type="button"
              onClick={() => handleTemplateSelect(template)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          To *
        </label>
        
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="parent">Parents</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={formData.recipient_id}
          onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          required
          disabled={sending}
        >
          <option value="">Select Recipient</option>
          {filteredRecipients.map(recipient => (
            <option key={recipient.id} value={recipient.profile_id}>
              {recipient.first_name} {recipient.last_name} ({recipient.role}) - {recipient.email}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject *
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Enter message subject"
          required
          disabled={sending}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={10}
          placeholder="Enter your message here..."
          required
          disabled={sending}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={sending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  )
}
