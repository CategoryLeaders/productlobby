'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (message: string, variant: ToastVariant, duration?: number, action?: ToastMessage['action']) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback(
    (message: string, variant: ToastVariant, duration = 5000, action?: ToastMessage['action']) => {
      const id = Math.random().toString(36).substr(2, 9)
      const toast: ToastMessage = { id, message, variant, action }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

interface ToastProps {
  toast: ToastMessage
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const variantConfig: Record<
    ToastVariant,
    { bg: string; border: string; icon: React.ReactNode; text: string }
  > = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      text: 'text-red-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      text: 'text-blue-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      text: 'text-yellow-800',
    },
  }

  const config = variantConfig[toast.variant]

  return (
    <div
      className={cn(
        'pointer-events-auto animate-slide-up flex items-start gap-3 rounded-lg border px-4 py-3 shadow-elevated',
        config.bg,
        config.border
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex-shrink-0 pt-0.5">{config.icon}</div>
      <div className="flex-1">
        <p className={cn('text-sm font-medium', config.text)}>{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              onClose()
            }}
            className={cn(
              'mt-2 text-sm font-medium underline transition-opacity hover:opacity-75',
              config.text
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className={cn('flex-shrink-0 transition-opacity hover:opacity-75', config.text)}
        aria-label="Dismiss notification"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

ToastProvider.displayName = 'ToastProvider'
