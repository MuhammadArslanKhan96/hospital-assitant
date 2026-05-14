/**
 * Utility to generate specialized prompt instructions for custom tools.
 * This ensures the agent knows how to call them and what fields are required,
 * while preventing repetitive questioning.
 */
export function generateCustomToolInstructions(customTools: any[]): string {
    if (!customTools || customTools.length === 0) return '';

    let instructions = `\n\n## CUSTOM TOOL PROTOCOLS\n`;
    instructions += `You have been equipped with specialized tools for this tenant. Follow these protocols strictly:\n`;

    for (const tool of customTools) {
        let params: any = {};
        try {
            params = typeof tool.parameters === 'string' ? JSON.parse(tool.parameters) : tool.parameters;
        } catch (e) {
            console.error(`Failed to parse parameters for tool ${tool.name}`);
        }

        const requiredFields = params.required || [];
        const properties = params.properties || {};

        instructions += `\n### TOOL: ${tool.name}\n`;
        instructions += `- **Description**: ${tool.description}\n`;
        
        if (Object.keys(properties).length > 0) {
            instructions += `- **Required Fields**: ${requiredFields.join(', ') || 'None'}\n`;
            instructions += `- **Parameter Details**:\n`;
            for (const [key, details] of Object.entries(properties) as any) {
                instructions += `  - '${key}': ${(details as any).description || 'No description provided.'}\n`;
            }
        }

        instructions += `- **Usage Protocol**: Before calling '${tool.name}', ensure you have gathered all required fields. **IMPORTANT**: If the user has already provided a piece of information earlier in the conversation, or if you already have it from the customer context, DO NOT ask for it again. Only prompt for missing information. once all required fields are known, execute the tool immediately.\n`;
    }

    return instructions;
}

export const TIME_CONTEXT_INSTRUCTION = (tz: string) => `\n\n[TIME_CONTEXT_ENABLED] The current date and time is {{now}}. Today is {{day}} of {{month}}, {{year}}. ALWAYS use this as your absolute reference for scheduling. If you need to suggest 'tomorrow', calculate it based on this exact date. Note: Time is in UTC, please adjust to the user's timezone (e.g. ${tz}) if needed.`;

export const SCHEDULING_PROTOCOL_INSTRUCTION = `\n\n## SCHEDULING & CALENDAR PROTOCOL
- You know today's date is {{day}} of {{month}}, {{year}}.
- To ensure your 'IMMEDIATE WEEKEND CHECK' and date calculations are 100% accurate, you should rely on the 'get_customer_context' tool.
- This tool provides a validated 14-day calendar reference. Use it to verify days of the week before confirming any appointment.
- If 'Long Term Memory' is enabled, call this tool at the very start of the call to have the calendar and patient history ready immediately.`;

export const COMPLIANCE_PROTOCOL_INSTRUCTION = `\n\nSMS Consent Instructions: At the natural conclusion of the call, before saying goodbye, you MUST ask: 'By the way, do you consent to receiving text messages from us regarding your account or future updates?' If they say yes, ask: 'Should we use the number we are currently connected on, or a different number?' Once you have their answer, execute the record_contact_preferences tool to log their choice. If they say no, execute the tool logging sms_consent as false.

DNC Instructions: If at ANY point in the call the user gets angry, asks to be removed from our list, or says 'do not call me', apologize politely, immediately execute the record_contact_preferences tool with dnc_requested set to true, and end the call.`;

export const CALLER_ID_INSTRUCTION = `\n\n[CALLER_ID] You are currently speaking with the customer on the following phone number: {{customer.number}}. If the customer refers to 'this number' or asks you to use the current line for callbacks or SMS, use {{customer.number}} as the reference.`;

interface PromptOptions {
    tenantTimezone?: string;
    voicemailHandling?: string | null;
    longTermMemory?: boolean;
    reasoningMode?: boolean;
    enableTimeContext?: boolean;
    enableSchedulingProtocol?: boolean;
    enableComplianceProtocol?: boolean;
    enableCallerId?: boolean;
    enableSilenceReengagement?: boolean;
}

/**
 * Builds the complete system prompt with all dynamic injections.
 */
export function buildFullSystemPrompt(basePrompt: string, options: PromptOptions): string {
    let finalPrompt = basePrompt;

    // 0.5 Caller ID Context
    if (options.enableCallerId !== false) {
        finalPrompt += CALLER_ID_INSTRUCTION;
    }

    // 1. Time Context
    if (options.enableTimeContext !== false) {
        finalPrompt += TIME_CONTEXT_INSTRUCTION(options.tenantTimezone || 'UTC');
    }

    // 2. Voicemail
    if (options.voicemailHandling) {
        finalPrompt += `\n\nIf you encounter a voicemail system or answering machine, follow these instructions:\n${options.voicemailHandling}`;
    }

    // 3. Scheduling Protocols
    if (options.enableSchedulingProtocol !== false) {
        finalPrompt += SCHEDULING_PROTOCOL_INSTRUCTION;
        if (options.longTermMemory) {
            finalPrompt += `\n\n(Instruction: Call 'get_customer_context' now to greet the patient and load the calendar.)`;
        }
    }

    // 5. Compliance Protocols (SMS/DNC)
    if (options.enableComplianceProtocol !== false) {
        finalPrompt += `\n\n${COMPLIANCE_PROTOCOL_INSTRUCTION}`;
    }

    // 6. Reasoning Mode
    if (options.reasoningMode) {
        finalPrompt = `[REASONING MODE ENABLED] You are in a high-cognitive reasoning mode. Think step-by-step before calling tools or answering complex queries.\n\n${finalPrompt}`;
    }

    return finalPrompt;
}
