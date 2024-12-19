import { NextRequest, NextResponse } from 'next/server'

// 添加静态生成配置
export const dynamic = 'force-static'
export const revalidate = false

const API_KEY = process.env.ZHIPUAI_API_KEY || ''
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

// 检查并添加句尾符号
function addEndPunctuation(text: string): string {
  const endPunctuations = ['。', '！', '？', '~', '…', '.', '!', '?']
  if (!endPunctuations.some(punct => text.trim().endsWith(punct))) {
    return text.trim() + '。'
  }
  return text
}

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // 处理用户消息的句尾符号
  const processedMessages = messages.map((msg: ChatMessage) => {
    if (msg.role === 'user') {
      return {
        ...msg,
        content: addEndPunctuation(msg.content)
      }
    }
    return msg
  })

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "glm-4-plus",
        messages: processedMessages,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    // 创建一个新的 TransformStream
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    
    // 处理流式响应
    const processStream = async () => {
      try {
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const text = new TextDecoder().decode(value)
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(5).trim()
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices[0]?.delta?.content || ''
                if (content) {
                  await writer.write(
                    `data: ${JSON.stringify({ content })}\n\n`
                  )
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('Stream processing error:', error)
      } finally {
        await writer.write('data: [DONE]\n\n')
        await writer.close()
      }
    }

    processStream()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) { // 添加类型注解
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
