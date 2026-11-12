/**
 * Provider-neutral agent contract. The WhatsApp bot only talks to `AgentProvider`,
 * so the model vendor can be swapped without touching the channel or the business tools.
 */

export type ChatTurn = { role: 'user' | 'assistant'; text: string }

/** JSON Schema for a tool's input (an object schema) */
export type ToolInputSchema = {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
  additionalProperties?: boolean
}

export type AgentTool = {
  name: string
  description: string
  inputSchema: ToolInputSchema
  /**
   * Runs the tool. Anything about who is asking is bound when the tool is built,
   * never read from `input`, so the model can't ask for another customer's data.
   * Returns text (usually JSON) for the model; throw to report an error to it.
   */
  run: (input: Record<string, unknown>) => Promise<string>
}

export type AgentResult =
  | { kind: 'reply'; text: string }
  /** The model declined for safety reasons */
  | { kind: 'refused' }

export interface AgentProvider {
  run(input: { system: string; history: ChatTurn[]; tools: AgentTool[]; maxSteps: number }): Promise<AgentResult>
}

/** Thrown when the loop can't finish (too many steps, cut off, empty reply) */
export class AgentError extends Error {}
