'use client'

import { useChat } from 'ai/react'
import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2 } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

export default function Chat() {
  const [chatId, setChatId] = useState<string | null>(null)
  const { messages, input, handleInputChange, handleSubmit, setMessages, error } = useChat()
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedChatId = localStorage.getItem('chatId')
    if (storedChatId) {
      setChatId(storedChatId)
      fetchChatHistory(storedChatId)
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (error) {
      if (error.message.includes('Rate limit exceeded')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Please try again in a minute.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "An error occurred",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }, [error])

  const fetchChatHistory = async (id: string) => {
    const response = await fetch(`/api/chat?chatId=${id}`)
    if (response.ok) {
      const history = await response.json()
      setMessages(history)
    }
  }

  const clearChat = async () => {
    if (!chatId) return;

    const response = await fetch(`/api/chat?chatId=${chatId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setMessages([]);
      localStorage.removeItem('chatId');
      setChatId(null);
    } else {
      console.error('Failed to clear chat history');
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsTyping(true)
    const response = await handleSubmit(e, {
      headers: { 'X-Chat-Id': chatId || '' },
    })
    if (response) {
      const newChatId = response.headers.get('X-Chat-Id')
      if (newChatId && !chatId) {
        setChatId(newChatId)
        localStorage.setItem('chatId', newChatId)
      }
    }
    setIsTyping(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Memory Chat (GPT-4)</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              disabled={!chatId || messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center bg-gray-200 p-3 rounded-lg">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={onSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isTyping || !input.trim()}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

