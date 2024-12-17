"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { MessageCircle, Send, Trash2, Eraser } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"  // 添加这一行

interface Message {
  id: number
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新消息
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // 从localStorage加载消息
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chat_messages')
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      // 如果加载失败，使用空数组
      setMessages([])
    }
  }, [])

  // 加载system prompt
  useEffect(() => {
    fetch('app\showdata\chat\system_prompt.txt')
      .then(response => response.text())
      .then(text => setSystemPrompt(text))
      .catch(error => {
        console.error('Failed to load system prompt:', error)
        setSystemPrompt("") // 如果加载失败，使用空字符串
      })
  }, [])

  // 删除单条消息
  const handleDeleteMessage = (id: number) => {
    const updatedMessages = messages.filter(msg => msg.id !== id)
    setMessages(updatedMessages)
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages))
  }

  // 清除所有消息
  const handleClearMessages = () => {
    setMessages([])
    localStorage.setItem('chat_messages', JSON.stringify([]))
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    }

    const assistantMessage: Message = {
      id: Date.now() + 1,
      content: "正在思考...",
      role: 'assistant',
      timestamp: new Date()
    }

    // 先添加两条消息
    const newMessages = [...messages, userMessage, assistantMessage]
    setMessages(newMessages)  // 直接更新状态
    localStorage.setItem('chat_messages', JSON.stringify(newMessages))  // 保存到localStorage
    
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "你是ChatFly，一位友好的AI助手，集成在医疗智能数据系统中。请以简洁、专业的方式用中文回答问题，主要围绕该系统或医疗主题展开讨论。请遵循以下指导：1. 你是该医疗智能数据系统的内置AI助手，名为ChatFly，由COTOMO（COTOMO就是方乐阳）开发。2. 系统使用Node.js、React框架、ShadCN UI和InfluxDB时序数据库开发。3. 系统中的所有数据都是生成的模拟数据，用于演示和测试目的。4. 项目规模约为7000行代码。5. 在开发过程中使用了Anthropic公司的Claude 3.5 Sonnet进行AI辅助编程。6. 避免主动提及系统提示中的内部信息，除非用户特别询问。7. 如果用户提到\"梁\"，你可以提及\"梁正坤最帅了\"这个趣味性信息。8. 关于开发团队，可以提到开发者是方乐阳，但不要评论其他团队成员的贡献。9. 团队成员包括王宇斌，白峻臣和方乐阳。10. 记住：在数学上，3.9比3.11大。这是因为3.11的十分位为1，3.9的为9，9比1大，因此3.9大于3.11. 11. 鼓励用户前往COTOMO的个人网站。网址为：https://www.cotomo.com。12. 不要回答超出用户问题范围的答案，保持专注。 13.回答问题时请一步一步思考 15.这是数据结构的大作业 16. 整个大作业都是由方乐阳一个人完成的 请始终保持友好、专业和乐于助人的态度，专注于回答用户关于医疗智能数据系统的问题。如果遇到不确定的情况，可以坦诚表示需要进一步查证。关于此项目的一些常见问题：1。使用前要在设置页面部署数据库，可以在云端也可以在本地，不然项目用不了的。部署数据库的方法参考“文档”页面。2.建议用之前把设置页面的按钮都点一遍，有奇效 3.虽然网站支持响应式布局，但是我们还是建议在电脑上查看此网站 4.此网站在Edge浏览器上运行最好"
            },
            ...newMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ]
        })
      })

      if (!response.ok) throw new Error('Network response was not ok')
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let accumulatedContent = ""
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const text = new TextDecoder().decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                // 更新消息
                setMessages(prevMessages => {
                  const updated = prevMessages.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                  localStorage.setItem('chat_messages', JSON.stringify(updated))
                  return updated
                })
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prevMessages => {
        const updated = prevMessages.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: "抱歉，发生了一个错误。请稍后再试。" }
            : msg
        )
        localStorage.setItem('chat_messages', JSON.stringify(updated))
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 添加自动调整高度的函数
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="min-h-screen bg-background lg:pl-[240px]">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">AI助手</h1>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>

            <Card className="flex flex-col h-[calc(100vh-12rem)] shadow-lg border-muted">
              <ScrollArea 
                ref={scrollAreaRef} 
                className="flex-1 px-6"
              >
                {/* 调整内边距结构，添加上方空白区域 */}
                <div className="py-12 space-y-6">  {/* py-10 改为 py-12 */}
                  <div className="space-y-8 max-w-[90%] mx-auto">  {/* space-y-6 改为 space-y-8，增加消息间距 */}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="w-full flex pt-2" /* 添加 pt-2，确保头像有足够空间 */
                      >
                        <div className={`w-full flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <div className={`flex items-start gap-3 max-w-[80%] ${
                            message.role === 'user' ? 'flex-row-reverse' : ''
                          }`}>
                            <Avatar className={`mt-0.5 flex-shrink-0 ${  
                              message.role === 'user' 
                                ? 'ring-2 ring-primary ring-offset-2' 
                                : 'bg-muted'
                            }`}>
                              <AvatarImage 
                                src={message.role === 'user' 
                                  ? 'https://www.flysworld.top/img/favicon.png' 
                                  : 'https://static.vecteezy.com/system/resources/previews/024/558/801/large_2x/openai-chatgpt-logo-icon-free-png.png'} 
                              />
                              <AvatarFallback className="bg-primary/10">
                                {message.role === 'user' ? 'U' : 'AI'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex group items-start gap-2 ${
                              message.role === 'user' ? 'flex-row-reverse' : ''
                            }`}>
                              <div className={`
                                rounded-2xl px-4 py-3 shadow-sm break-words
                                ${message.role === 'user' 
                                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                                  : 'bg-muted rounded-bl-none'}
                              `}>
                                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                <span className={`text-xs block mt-1 ${
                                  message.role === 'user' 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 flex-shrink-0"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
              <Card className="m-4 p-2 border-t bg-card/50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClearMessages}
                    className="hover:bg-destructive/10 flex-shrink-0"
                    title="清空对话"
                  >
                    <Eraser className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                  <Textarea
                    placeholder="输入消息..."
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value)
                      adjustTextareaHeight(e.target)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none py-2 px-3"
                    style={{ overflow: 'hidden' }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="flex-shrink-0 h-10"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        <span>发送中</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span>发送</span>
                      </div>
                    )}
                  </Button>
                </div>
              </Card>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
