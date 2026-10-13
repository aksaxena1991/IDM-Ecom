import { env } from '../config/env.js'
import { GeminiLLMProvider } from './geminiProvider.js'
import { MockLLMProvider } from './mockProvider.js'
import type { GenerateInput, GenerateResult, LLMProvider } from './types.js'

export type ModelRoute = 'mock' | 'cloud' | 'self_hosted'

const MODEL_ROUTES: ModelRoute[] = ['mock', 'cloud', 'self_hosted']

export class ModelGateway {
  constructor(private readonly providers: Record<string, LLMProvider>) {}

  async generate(route: ModelRoute, input: GenerateInput): Promise<GenerateResult> {
    const provider = this.providers[route]
    if (!provider) {
      throw new Error(`Unsupported model route: ${route}`)
    }
    return provider.generate(input)
  }
}

export function createDefaultModelGateway(): ModelGateway {
  const providers: Record<string, LLMProvider> = {
    mock: new MockLLMProvider(),
  }

  if (env.GEMINI_API_KEY?.trim()) {
    const gemini = new GeminiLLMProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL)
    providers.cloud = gemini
    providers.self_hosted = gemini
  }

  return new ModelGateway(providers)
}

export function isModelRoute(value: string): value is ModelRoute {
  return (MODEL_ROUTES as string[]).includes(value)
}
