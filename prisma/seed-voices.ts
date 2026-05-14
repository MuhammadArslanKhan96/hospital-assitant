import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Same list as in route.ts
const FALLBACK_VOICES = [
    // VAPI Standard (Provider: vapi) - Assuming standard Vapi rate
    { id: 'Elliot', name: 'Elliot', provider: 'vapi', cost: 0.05 },
    { id: 'Kylie', name: 'Kylie', provider: 'vapi', cost: 0.05 },
    { id: 'Rohan', name: 'Rohan', provider: 'vapi', cost: 0.05 },
    { id: 'Lily', name: 'Lily', provider: 'vapi', cost: 0.05 },
    { id: 'Savannah', name: 'Savannah', provider: 'vapi', cost: 0.05 },
    { id: 'Hana', name: 'Hana', provider: 'vapi', cost: 0.05 },
    { id: 'Neha', name: 'Neha', provider: 'vapi', cost: 0.05 },
    { id: 'Cole', name: 'Cole', provider: 'vapi', cost: 0.05 },
    { id: 'Harry', name: 'Harry', provider: 'vapi', cost: 0.05 },
    { id: 'Paige', name: 'Paige', provider: 'vapi', cost: 0.05 },
    { id: 'Spencer', name: 'Spencer', provider: 'vapi', cost: 0.05 },
    { id: 'Leah', name: 'Leah', provider: 'vapi', cost: 0.05 },
    { id: 'Tara', name: 'Tara', provider: 'vapi', cost: 0.05 },
    { id: 'Jess', name: 'Jess', provider: 'vapi', cost: 0.05 },
    { id: 'Leo', name: 'Leo', provider: 'vapi', cost: 0.05 },
    { id: 'Dan', name: 'Dan', provider: 'vapi', cost: 0.05 },
    { id: 'Mia', name: 'Mia', provider: 'vapi', cost: 0.05 },
    { id: 'Zac', name: 'Zac', provider: 'vapi', cost: 0.05 },
    { id: 'Zoe', name: 'Zoe', provider: 'vapi', cost: 0.05 },

    // 11Labs Standard (Provider: 11labs) - Usually more expensive
    { id: 'sarah', name: 'Sarah', provider: '11labs', cost: 0.12 },
    { id: 'rachel', name: 'Rachel', provider: '11labs', cost: 0.12 },
    { id: 'charlie', name: 'Charlie', provider: '11labs', cost: 0.12 },
    { id: 'burt', name: 'Burt', provider: '11labs', cost: 0.12 },
    { id: 'marissa', name: 'Marissa', provider: '11labs', cost: 0.12 },
    { id: 'andrea', name: 'Andrea', provider: '11labs', cost: 0.12 },
    { id: 'phillip', name: 'Phillip', provider: '11labs', cost: 0.12 },
    { id: 'steve', name: 'Steve', provider: '11labs', cost: 0.12 },
    { id: 'joseph', name: 'Joseph', provider: '11labs', cost: 0.12 },
    { id: 'myra', name: 'Myra', provider: '11labs', cost: 0.12 },
    { id: 'paula', name: 'Paula', provider: '11labs', cost: 0.12 },
    { id: 'ryan', name: 'Ryan', provider: '11labs', cost: 0.12 },
    { id: 'drew', name: 'Drew', provider: '11labs', cost: 0.12 },
    { id: 'paul', name: 'Paul', provider: '11labs', cost: 0.12 },
    { id: 'mrb', name: 'Mr. B', provider: '11labs', cost: 0.12 },
    { id: 'matilda', name: 'Matilda', provider: '11labs', cost: 0.12 },
    { id: 'mark', name: 'Mark', provider: '11labs', cost: 0.12 },

    // OpenAI (Provider: openai) - Cheaper
    { id: 'alloy', name: 'Alloy', provider: 'openai', cost: 0.03 },
    { id: 'echo', name: 'Echo', provider: 'openai', cost: 0.03 },
    { id: 'fable', name: 'Fable', provider: 'openai', cost: 0.03 },
    { id: 'onyx', name: 'Onyx', provider: 'openai', cost: 0.03 },
    { id: 'nova', name: 'Nova', provider: 'openai', cost: 0.03 },
    { id: 'shimmer', name: 'Shimmer', provider: 'openai', cost: 0.03 },

    // Deepgram (Provider: deepgram)
    { id: 'asteria', name: 'Asteria', provider: 'deepgram', cost: 0.04 },
    { id: 'luna', name: 'Luna', provider: 'deepgram', cost: 0.04 },
    { id: 'stella', name: 'Stella', provider: 'deepgram', cost: 0.04 },
    { id: 'athena', name: 'Athena', provider: 'deepgram', cost: 0.04 },
    { id: 'hera', name: 'Hera', provider: 'deepgram', cost: 0.04 },
    { id: 'orion', name: 'Orion', provider: 'deepgram', cost: 0.04 },
    { id: 'arcas', name: 'Arcas', provider: 'deepgram', cost: 0.04 },
    { id: 'perseus', name: 'Perseus', provider: 'deepgram', cost: 0.04 },
    { id: 'angus', name: 'Angus', provider: 'deepgram', cost: 0.04 },
    { id: 'orpheus', name: 'Orpheus', provider: 'deepgram', cost: 0.04 },
    { id: 'helios', name: 'Helios', provider: 'deepgram', cost: 0.04 },
    { id: 'zeus', name: 'Zeus', provider: 'deepgram', cost: 0.04 },

    // Cartesia (Provider: cartesia) - Premium
    { id: 'sonic-english', name: 'Sonic English', provider: 'cartesia', cost: 0.08 },

    // Kokoro ONNX (Provider: custom-render) - Free/Self-Hosted
    { id: 'af_bella', name: 'Bella (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_nicole', name: 'Nicole (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_sky', name: 'Sky (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_alloy', name: 'Alloy (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_aoede', name: 'Aoede (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_heart', name: 'Heart (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_jessica', name: 'Jessica (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_kore', name: 'Kore (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_nova', name: 'Nova (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'af_river', name: 'River (US Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_adam', name: 'Adam (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_echo', name: 'Echo (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_eric', name: 'Eric (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_fenrir', name: 'Fenrir (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_liam', name: 'Liam (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_michael', name: 'Michael (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_onyx', name: 'Onyx (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_puck', name: 'Puck (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'am_pug', name: 'Pug (US Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'bf_alice', name: 'Alice (UK Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'bf_emma', name: 'Emma (UK Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'bf_isabella', name: 'Isabella (UK Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'bf_lily', name: 'Lily (UK Female)', provider: 'custom-render', cost: 0.0 },
    { id: 'bm_daniel', name: 'Daniel (UK Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'bm_fable', name: 'Fable (UK Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'bm_george', name: 'George (UK Male)', provider: 'custom-render', cost: 0.0 },
    { id: 'bm_lewis', name: 'Lewis (UK Male)', provider: 'custom-render', cost: 0.0 },
];

async function main() {
  console.log(`Seeding ${FALLBACK_VOICES.length} standard voices...`);

  for (const voice of FALLBACK_VOICES) {
    const type = 'voice';
    const value = voice.id;
    const name = `${voice.name} (${voice.provider})`;
    const provider = voice.provider;
    const costPerUnit = voice.cost || 0.05;

    await prisma.providerModel.upsert({
      where: {
        type_value: { type, value }
      },
      update: {
        name,
        provider,
        costPerUnit,
        isEnabled: true // Ensure enabled
      },
      create: {
        type,
        name,
        value,
        provider,
        costPerUnit,
        isEnabled: true
      }
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
