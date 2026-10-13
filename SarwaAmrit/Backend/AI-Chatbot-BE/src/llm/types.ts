export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

export type GenerateInput = {
  systemPrompt: string
  messages: ChatMessage[]
  tools?: Record<string, unknown>[]
}

export type GenerateResult = {
  answer: string
  sources: Record<string, unknown>[]
}

export interface LLMProvider {
  generate(input: GenerateInput): Promise<GenerateResult>
}
