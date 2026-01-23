'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Zap, Lightbulb, Clock, Smile } from 'lucide-react'

interface JesterMessageProps {
  type: 'greeting' | 'question' | 'insight' | 'status' | 'humor'
  content: string
  timestamp: string
}

export default function JesterMessage({ type, content, timestamp }: JesterMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getIcon = () => {
    switch (type) {
      case 'greeting':
        return <Sparkles className="w-4 h-4" />
      case 'question':
        return <Lightbulb className="w-4 h-4" />
      case 'insight':
        return <Zap className="w-4 h-4" />
      case 'status':
        return <Clock className="w-4 h-4" />
      case 'humor':
        return <Smile className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'greeting':
        return 'bg-purple-50 border-l-4 border-purple-400'
      case 'question':
        return 'bg-blue-50 border-l-4 border-blue-400'
      case 'insight':
        return 'bg-amber-50 border-l-4 border-amber-400'
      case 'status':
        return 'bg-green-50 border-l-4 border-green-400'
      case 'humor':
        return 'bg-pink-50 border-l-4 border-pink-400'
      default:
        return 'bg-gray-50 border-l-4 border-gray-400'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'greeting':
        return 'text-purple-700'
      case 'question':
        return 'text-blue-700'
      case 'insight':
        return 'text-amber-700'
      case 'status':
        return 'text-green-700'
      case 'humor':
        return 'text-pink-700'
      default:
        return 'text-gray-700'
    }
  }

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`rounded-lg p-3 mb-3 ${getBackgroundColor()}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-1 ${getTextColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className={`text-sm leading-relaxed ${getTextColor()}`}>
              {content}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              🎭 Jester • {new Date(timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
