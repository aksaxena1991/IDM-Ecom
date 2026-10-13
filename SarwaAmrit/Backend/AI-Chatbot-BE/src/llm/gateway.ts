import { MockLLMProvider } from './mockProvider.js'
import type { GenerateInput, GenerateResult, LLMProvider } from './types.js'

export type ModelRoute = 'mock' | 'cloud' | 'self_hosted'

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
  return new ModelGateway({
    mock: new MockLLMProvider(),
  })
}
