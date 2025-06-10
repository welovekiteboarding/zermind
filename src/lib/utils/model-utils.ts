import { type Provider } from "@/lib/schemas/api-keys";

/**
 * Determines the provider from a model string
 */
export function getProviderFromModel(model: string): Provider {
  if (model.startsWith("openai/") || model.startsWith("gpt-")) {
    return "openai";
  }
  if (model.startsWith("anthropic/") || model.startsWith("claude-")) {
    return "anthropic";
  }
  if (model.startsWith("google/") || model.startsWith("gemini-")) {
    return "google";
  }
  if (model.startsWith("meta/") || model.startsWith("llama-")) {
    return "meta";
  }
  // Default to OpenRouter for any other models
  return "openrouter";
}

/**
 * Gets a user-friendly provider name
 */
export function getProviderDisplayName(provider: Provider): string {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "google":
      return "Google";
    case "meta":
      return "Meta";
    case "openrouter":
      return "OpenRouter";
    default:
      return provider;
  }
}

/**
 * Gets the model display name without provider prefix
 */
export function getModelDisplayName(model: string): string {
  // Remove common provider prefixes
  return model
    .replace(/^(openai|anthropic|google|meta)\//i, "")
    .replace(/^(gpt-|claude-|gemini-|llama-)/i, (match) => match.toUpperCase());
}

/**
 * Checks if a model requires a specific provider (not available via OpenRouter)
 */
export function isDirectProviderModel(model: string): boolean {
  // These models typically require direct API access
  return (
    model.startsWith("gpt-") ||
    model.startsWith("claude-") ||
    model.startsWith("gemini-")
  );
}
