import type { GenerateInput, GenerateResult, LLMProvider } from './types.js'

/** Phase 1 placeholder until cloud/self-hosted adapters are wired. */
export class MockLLMProvider implements LLMProvider {
  async generate(input: GenerateInput): Promise<GenerateResult> {
    const lastUser = [...input.messages].reverse().find((m) => m.role === 'user')
    const question = lastUser?.content ?? ''
    return {
      answer: `[mock] Received your question for this application scope. Full LLM routing is not configured yet.\n\nYou asked: ${question}`,
      sources: [],
    }
  }
}
