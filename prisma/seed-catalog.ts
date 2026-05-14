import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATALOG_DATA = [
  // --- MODELS ---
  { type: 'model', name: 'GPT-4o (Standard)', value: 'gpt-4o', provider: 'openai', costPerUnit: 0.05 },
  { type: 'model', name: 'GPT-4o Mini (Fast & Cheap)', value: 'gpt-4o-mini', provider: 'openai', costPerUnit: 0.01 },
  { type: 'model', name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', provider: 'openai', costPerUnit: 0.01 },
  { type: 'model', name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20240620', provider: 'anthropic', costPerUnit: 0.06 },
  { type: 'model', name: 'Claude 3 Opus', value: 'claude-3-opus-20240229', provider: 'anthropic', costPerUnit: 0.15 },
  { type: 'model', name: 'Llama 3.1 70B (Fastest)', value: 'llama-3.1-70b-versatile', provider: 'groq', costPerUnit: 0.02 },
  { type: 'model', name: 'Llama 3.1 8B (Instant)', value: 'llama-3.1-8b-instant', provider: 'groq', costPerUnit: 0.005 },
  { type: 'model', name: 'Mixtral 8x7b', value: 'mixtral-8x7b-32768', provider: 'groq', costPerUnit: 0.01 },

  // --- VOICES ---
  // VAPI Standard (Provider: vapi)
  { type: 'voice', name: 'Elliot (Vapi)', value: 'Elliot', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Kylie (Vapi)', value: 'Kylie', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Rohan (Vapi)', value: 'Rohan', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Lily (Vapi)', value: 'Lily', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Savannah (Vapi)', value: 'Savannah', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Hana (Vapi)', value: 'Hana', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Neha (Vapi)', value: 'Neha', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Cole (Vapi)', value: 'Cole', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Harry (Vapi)', value: 'Harry', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Paige (Vapi)', value: 'Paige', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Spencer (Vapi)', value: 'Spencer', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Leah (Vapi)', value: 'Leah', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Tara (Vapi)', value: 'Tara', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Jess (Vapi)', value: 'Jess', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Leo (Vapi)', value: 'Leo', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Dan (Vapi)', value: 'Dan', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Mia (Vapi)', value: 'Mia', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Zac (Vapi)', value: 'Zac', provider: 'vapi', costPerUnit: 0.05 },
  { type: 'voice', name: 'Zoe (Vapi)', value: 'Zoe', provider: 'vapi', costPerUnit: 0.05 },

  // 11Labs Standard (Provider: 11labs)
  { type: 'voice', name: 'Sarah (11Labs)', value: 'sarah', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Rachel (11Labs)', value: 'rachel', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Jessica (11Labs)', value: 'jessica', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Charlie (11Labs)', value: 'charlie', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Burt (11Labs)', value: 'burt', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Marissa (11Labs)', value: 'marissa', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Andrea (11Labs)', value: 'andrea', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Phillip (11Labs)', value: 'phillip', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Steve (11Labs)', value: 'steve', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Joseph (11Labs)', value: 'joseph', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Myra (11Labs)', value: 'myra', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Paula (11Labs)', value: 'paula', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Ryan (11Labs)', value: 'ryan', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Drew (11Labs)', value: 'drew', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Paul (11Labs)', value: 'paul', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Mr. B (11Labs)', value: 'mrb', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Matilda (11Labs)', value: 'matilda', provider: '11labs', costPerUnit: 0.12 },
  { type: 'voice', name: 'Mark (11Labs)', value: 'mark', provider: '11labs', costPerUnit: 0.12 },

  // OpenAI (Provider: openai)
  { type: 'voice', name: 'Alloy (OpenAI)', value: 'alloy', provider: 'openai', costPerUnit: 0.03 },
  { type: 'voice', name: 'Echo (OpenAI)', value: 'echo', provider: 'openai', costPerUnit: 0.03 },
  { type: 'voice', name: 'Fable (OpenAI)', value: 'fable', provider: 'openai', costPerUnit: 0.03 },
  { type: 'voice', name: 'Onyx (OpenAI)', value: 'onyx', provider: 'openai', costPerUnit: 0.03 },
  { type: 'voice', name: 'Nova (OpenAI)', value: 'nova', provider: 'openai', costPerUnit: 0.03 },
  { type: 'voice', name: 'Shimmer (OpenAI)', value: 'shimmer', provider: 'openai', costPerUnit: 0.03 },

  // Deepgram (Provider: deepgram)
  { type: 'voice', name: 'Asteria (Deepgram)', value: 'asteria', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Luna (Deepgram)', value: 'luna', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Stella (Deepgram)', value: 'stella', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Athena (Deepgram)', value: 'athena', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Hera (Deepgram)', value: 'hera', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Orion (Deepgram)', value: 'orion', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Arcas (Deepgram)', value: 'arcas', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Perseus (Deepgram)', value: 'perseus', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Angus (Deepgram)', value: 'angus', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Orpheus (Deepgram)', value: 'orpheus', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Helios (Deepgram)', value: 'helios', provider: 'deepgram', costPerUnit: 0.04 },
  { type: 'voice', name: 'Zeus (Deepgram)', value: 'zeus', provider: 'deepgram', costPerUnit: 0.04 },

  // Cartesia (Provider: cartesia)
  { type: 'voice', name: 'Sonic English (Cartesia)', value: 'sonic-english', provider: 'cartesia', costPerUnit: 0.08 },

  // TRANSCRIBERS
  { type: 'transcriber', name: 'Deepgram Nova 2 (Default)', value: 'nova-2', provider: 'deepgram', costPerUnit: 0.01 },
  { type: 'transcriber', name: 'Deepgram Nova 2 Phone', value: 'nova-2-phone', provider: 'deepgram', costPerUnit: 0.01 },
  { type: 'transcriber', name: 'Talkscriber', value: 'talkscriber', provider: 'talkscriber', costPerUnit: 0.02 },
];

async function main() {
  console.log(`Seeding Catalog with ${CATALOG_DATA.length} items...`);

  for (const item of CATALOG_DATA) {
    await prisma.providerModel.upsert({
      where: {
        type_value: {
          type: item.type,
          value: item.value
        }
      },
      update: {
        name: item.name,
        provider: item.provider,
        costPerUnit: item.costPerUnit,
        isEnabled: true // Ensure enabled to show in dropdowns
      },
      create: {
        type: item.type,
        name: item.name,
        value: item.value,
        provider: item.provider,
        costPerUnit: item.costPerUnit,
        isEnabled: true
      }
    });
  }

  console.log('Catalog Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
