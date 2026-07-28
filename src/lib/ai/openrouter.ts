import OpenAI from "openai"
import { getModelConfig, type ModelTier } from "./model-config"

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
})

interface GenerateOptions {
  tier?: ModelTier
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

interface GenerateResult {
  content: string
  model: string
  tokensIn: number
  tokensOut: number
}

export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const {
    tier = "free",
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens = 4096,
  } = options

  const config = getModelConfig(tier)
  const models = [config.primary, ...config.fallbacks]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      })

      const choice = response.choices[0]
      if (!choice?.message?.content) continue

      return {
        content: choice.message.content,
        model: response.model ?? model,
        tokensIn: response.usage?.prompt_tokens ?? 0,
        tokensOut: response.usage?.completion_tokens ?? 0,
      }
    } catch (error) {
      lastError = error as Error
      console.warn(`[AI] Model ${model} failed: ${(error as Error).message}. Trying next...`)
      continue
    }
  }

  throw lastError ?? new Error("All AI models failed. Please try again later.")
}
