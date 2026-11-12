import Anthropic from '@anthropic-ai/sdk'
import { AgentError, type AgentProvider, type AgentResult } from '@/lib/agent/types'

/** Cheap and fast enough for chat; override with AGENT_MODEL */
const DEFAULT_MODEL = 'claude-haiku-5-5'

/** Claude through the official SDK, with a hand-written tool loop (reads ANTHROPIC_API_KEY) */
export function createAnthropicProvider(options: { model?: string } = {}): AgentProvider {
  const client = new Anthropic({ timeout: 45_000, maxRetries: 1 })
  const model = options.model ?? process.env.AGENT_MODEL ?? DEFAULT_MODEL

  return {
    async run({ system, history, tools, maxSteps }): Promise<AgentResult> {
      const toolDefs: Anthropic.Tool[] = tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }))
      const messages: Anthropic.MessageParam[] = history.map((turn) => ({ role: turn.role, content: turn.text }))

      for (let step = 0; step < maxSteps; step++) {
        const response = await client.messages.create({
          model,
          // Room for a little thinking plus a short chat reply; only a ceiling
          max_tokens: 4096,
          // A bit of reasoning helps pick the right product and link; low effort keeps it short and cheap
          thinking: { type: 'adaptive' },
          output_config: { effort: 'low' },
          // Caches system + tools + the conversation so far: the next step of the tool loop and the
          // customer's next message (within 5 minutes) re-read it at a tenth of the price
          cache_control: { type: 'ephemeral' },
          system,
          tools: toolDefs,
          messages,
        })

        const usage = response.usage
        console.log(
          `Agent step ${step + 1}: in ${usage.input_tokens} (cache read ${usage.cache_read_input_tokens ?? 0}, write ${usage.cache_creation_input_tokens ?? 0}), out ${usage.output_tokens}`
        )

        if (response.stop_reason === 'refusal') return { kind: 'refused' }
        if (response.stop_reason === 'max_tokens') throw new AgentError('Reply was cut off (max_tokens)')

        if (response.stop_reason !== 'tool_use') {
          const text = response.content
            .filter((block): block is Anthropic.TextBlock => block.type === 'text')
            .map((block) => block.text)
            .join('\n')
            .trim()
          if (!text) throw new AgentError(`Empty reply (stop_reason: ${response.stop_reason})`)
          return { kind: 'reply', text }
        }

        // Thinking blocks go back unchanged along with the tool calls
        messages.push({ role: 'assistant', content: response.content })
        const calls = response.content.filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
        const results = await Promise.all(
          calls.map(async (call): Promise<Anthropic.ToolResultBlockParam> => {
            const tool = tools.find((t) => t.name === call.name)
            const input = call.input && typeof call.input === 'object' ? (call.input as Record<string, unknown>) : {}
            try {
              if (!tool) throw new Error(`Unknown tool ${call.name}`)
              return { type: 'tool_result', tool_use_id: call.id, content: await tool.run(input) }
            } catch (error) {
              console.error(`Agent tool ${call.name} failed:`, error)
              const message = error instanceof Error ? error.message : 'Tool failed'
              return { type: 'tool_result', tool_use_id: call.id, content: `Error: ${message}`, is_error: true }
            }
          })
        )
        // All results in one message, so parallel calls keep working
        messages.push({ role: 'user', content: results })
      }

      throw new AgentError(`No final reply after ${maxSteps} steps`)
    },
  }
}
