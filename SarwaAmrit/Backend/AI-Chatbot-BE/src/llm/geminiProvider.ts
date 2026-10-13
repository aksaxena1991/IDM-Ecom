import { GoogleGenerativeAI, type Content } from '@google/generative-ai'

import type { ChatMessage, GenerateInput, GenerateResult, LLMProvider } from './types.js'

function toGeminiContents(messages: ChatMessage[]): Content[] {
  const contents: Content[] = []

  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') {
      continue
    }
    const role = message.role === 'assistant' ? 'model' : 'user'
    const last = contents[contents.length - 1]
    if (last && last.role === role) {
      const part = last.parts[0]
      if (part && 'text' in part && typeof part.text === 'string') {
        part.text = `${part.text}\n\n${message.content}`
      }
      continue
    }
    contents.push({ role, parts: [{ text: message.content }] })
  }

  if (contents.length > 0 && contents[0]!.role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: '(conversation continued)' }] })
  }

  return contents
}

export class GeminiLLMProvider implements LLMProvider {
  private readonly client: GoogleGenerativeAI

  constructor(
    apiKey: string,
    private readonly modelName: string,
  ) {
    if (!apiKey.trim()) {
      throw new Error('GEMINI_API_KEY is required for the cloud LLM route')
    }
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: input.systemPrompt,
    })

    const contents = toGeminiContents(input.messages)
    if (contents.length === 0) {
      return { answer: '', sources: [] }
    }

    const result = await model.generateContent({ contents })
    const answer = result.response.text()?.trim() ?? ''
    if (!answer) {
      throw new Error('Gemini returned an empty response')
    }

    return {
      answer,
      sources: [],
    }
  }
}
