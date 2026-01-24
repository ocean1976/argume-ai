import React from 'react'
import { MessageBubble as MessageBubbleCore, MessageType } from './MessageBubble'
import { ModelType } from '../ModelAvatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  modelId?: string
  type?: MessageType
  timestamp?: string
}

interface MessageBubbleWrapperProps {
  message: Message
}

const MessageBubble = ({ message }: MessageBubbleWrapperProps) => {
  return (
    <MessageBubbleCore
      role={message.role}
      content={message.content}
      model={message.model as ModelType}
      modelId={message.modelId}
      type={message.type}
      timestamp={message.timestamp}
    />
  )
}

export default MessageBubble
