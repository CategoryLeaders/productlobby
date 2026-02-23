'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Send, Users, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface ChatMessage {
  id: string
  userId: string
  user: {
    id: string
    displayName: string
    avatar: string | null
  }
  content: string
  createdAt: string
}

interface LiveChatProps {
  campaignId: string
  currentUserId: string | null
  currentUserName: string | null
  currentUserAvatar: string | null
}

export function LiveChat({
  campaignId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const CHARACTER_LIMIT = 500

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/chat`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data.data || [])
        setOnlineCount(data.onlineCount || 0)
        setError(null)
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError('Failed to load messages')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [campaignId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUserId) {
      setError('You must be logged in to send messages')
      return
    }

    if (!newMessage.trim()) {
      return
    }

    try {
      setIsSending(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      const data = await response.json()

      // Add new message to the list
      setMessages((prev) => [...prev, data.data])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Live Chat</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{onlineCount}</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-500">
              <p className="text-sm font-medium">Be the first to say something!</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation and connect with others.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.userId === currentUserId
            const avatar = message.user.avatar

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  isOwnMessage && 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white',
                    avatar
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                  )}
                  title={message.user.displayName}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={message.user.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(message.user.displayName)
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-xs',
                    isOwnMessage && 'items-end'
                  )}
                >
                  <div className="px-3 py-2 rounded-lg break-words whitespace-pre-wrap">
                    <p
                      className={cn(
                        'text-sm',
                        isOwnMessage
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      )}
                      style={{
                        paddingLeft: isOwnMessage ? '12px' : '12px',
                        paddingRight: isOwnMessage ? '12px' : '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        borderRadius: isOwnMessage ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      }}
                    >
                      {message.content}
                    </p>
                  </div>

                  {/* Timestamp & Sender Info */}
                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs text-gray-500 px-2',
                      isOwnMessage && 'flex-row-reverse'
                    )}
                  >
                    <span>{formatRelativeTime(message.createdAt)}</span>
                    {!isOwnMessage && (
                      <span className="font-medium text-gray-700">
                        {message.user.displayName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        {!currentUserId ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600">
              <a href="/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
              {' '}to join the conversation
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  if (e.target.value.length <= CHARACTER_LIMIT) {
                    setNewMessage(e.target.value)
                  }
                }}
                placeholder="Type a message..."
                maxLength={CHARACTER_LIMIT}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSending}
              />
              <span className="absolute right-3 top-2 text-xs text-gray-400">
                {newMessage.length}/{CHARACTER_LIMIT}
              </span>
            </div>
            <Button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              size="sm"
              className="gap-2"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
