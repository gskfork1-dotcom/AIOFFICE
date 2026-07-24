export type ModelTier = "free" | "starter" | "pro" | "business"

interface ModelConfig {
  primary: string
  fallbacks: string[]
}

function getEnv(key: string, fallback: string): string {
  return process.env[key] || fallback
}

const MODEL_CONFIG: Record<ModelTier, ModelConfig> = {
  free: {
    primary: getEnv("AI_MODEL_FREE_PRIMARY", "nvidia/nemotron-3-ultra-550b-a55b:free"),
    fallbacks: [
      getEnv("AI_MODEL_FREE_FALLBACK_1", "nvidia/nemotron-3-super-120b-a12b:free"),
      getEnv("AI_MODEL_FREE_FALLBACK_2", "openai/gpt-oss-20b:free"),
      getEnv("AI_MODEL_FREE_FALLBACK_3", "google/gemma-4-31b-it:free"),
    ],
  },
  starter: {
    primary: getEnv("AI_MODEL_STARTER_PRIMARY", "nvidia/nemotron-3-ultra-550b-a55b:free"),
    fallbacks: [
      getEnv("AI_MODEL_STARTER_FALLBACK_1", "openai/gpt-oss-20b:free"),
    ],
  },
  pro: {
    primary: getEnv("AI_MODEL_PRO_PRIMARY", "anthropic/claude-sonnet-4"),
    fallbacks: [
      getEnv("AI_MODEL_PRO_FALLBACK_1", "openai/gpt-4o"),
      getEnv("AI_MODEL_PRO_FALLBACK_2", "google/gemini-2.5-pro-preview"),
    ],
  },
  business: {
    primary: getEnv("AI_MODEL_BIZ_PRIMARY", "openai/gpt-4o"),
    fallbacks: [
      getEnv("AI_MODEL_BIZ_FALLBACK_1", "anthropic/claude-sonnet-4"),
      getEnv("AI_MODEL_BIZ_FALLBACK_2", "google/gemini-2.5-pro-preview"),
    ],
  },
}

export function getModelConfig(tier: ModelTier = "free"): ModelConfig {
  return MODEL_CONFIG[tier] ?? MODEL_CONFIG.free
}

export function getModelsArray(tier: ModelTier = "free"): string[] {
  const config = getModelConfig(tier)
  return [config.primary, ...config.fallbacks]
}

export function getTierFromRole(role: string): ModelTier {
  switch (role) {
    case "STARTER":
      return "starter"
    case "PRO":
      return "pro"
    case "BUSINESS":
      return "business"
    default:
      return "free"
  }
}
