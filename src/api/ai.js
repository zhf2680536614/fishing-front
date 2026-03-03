/**
 * AI 相关接口
 */

/**
 * 与 AI 进行流式对话
 * @param {string} message - 用户消息
 * @param {Object} callbacks - 回调函数
 * @param {Function} callbacks.onStart - 开始回调
 * @param {Function} callbacks.onMessage - 消息回调，接收增量内容
 * @param {Function} callbacks.onComplete - 完成回调，接收完整内容
 * @param {Function} callbacks.onError - 错误回调
 */
export const chatWithAI = async (message, callbacks = {}) => {
  const { onStart, onMessage, onComplete, onError } = callbacks

  try {
    const token = localStorage.getItem('token')
    const baseURL = 'http://localhost:8080/api'

    const response = await fetch(`${baseURL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    // 通知开始
    if (onStart) {
      onStart()
    }

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim()

          if (data === '[DONE]') {
            if (onComplete) {
              onComplete(fullContent)
            }
            return fullContent
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
              if (onMessage) {
                onMessage(parsed.content)
              }
            }
            if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch {
            // 如果不是 JSON，直接追加内容
            if (data && data !== '[DONE]') {
              fullContent += data
              if (onMessage) {
                onMessage(data)
              }
            }
          }
        }
      }
    }

    if (onComplete) {
      onComplete(fullContent)
    }

    return fullContent
  } catch (error) {
    console.error('AI Chat Error:', error)
    if (onError) {
      onError(error)
    }
    throw error
  }
}

/**
 * AI 识鱼接口
 * @param {File} file - 图片文件
 */
export const identifyFish = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('token')
  const baseURL = 'http://localhost:8080/api'

  const response = await fetch(`${baseURL}/ai/identify-fish`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
