import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

// Hardcoded fallback list of popular voices since the API endpoint /voice is unreliable/404
// Expanded list based on VAPI Schema FallbackVapiVoiceVoiceId
// Enriched with costPerUnit estimates (approximate $/min)
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
    // Using true ElevenLabs Voice IDs for maximum compatibility with VAPI
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', provider: '11labs', cost: 0.12 },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', provider: '11labs', cost: 0.12 },
    { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', provider: '11labs', cost: 0.12 },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', provider: '11labs', cost: 0.12 },
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
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', provider: '11labs', cost: 0.12 },
    { id: 'mark', name: 'Mark', provider: '11labs', cost: 0.12 },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', provider: '11labs', cost: 0.12 },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', provider: '11labs', cost: 0.12 },
    { id: 'TX3OmfQAxAagI2Dpy2rC', name: 'Liam', provider: '11labs', cost: 0.12 },
    { id: 'XB0fDUnXU5pow077YWq5', name: 'Charlotte', provider: '11labs', cost: 0.12 },
    { id: 'Xb7hH8MSALEjdAeoW6zZ', name: 'Alice', provider: '11labs', cost: 0.12 },
    { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', provider: '11labs', cost: 0.12 },

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
];

const FALLBACK_MODELS = [
    // High Performance
    { id: 'gpt-4o', name: 'GPT-4o (Premium)', provider: 'openai', cost: 0.06 },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', provider: 'anthropic', cost: 0.06 },

    // Cheaper / Faster Alternatives
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cost-Effective)', provider: 'openai', cost: 0.01 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy Fast)', provider: 'openai', cost: 0.01 },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B (Ultra-Fast Groq)', provider: 'groq', cost: 0.005 },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B (Fast & Smart Groq)', provider: 'groq', cost: 0.01 },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', provider: 'groq', cost: 0.008 }
];

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!process.env.VAPI_API_KEY) {
        return NextResponse.json({ error: 'VAPI_API_KEY not configured' }, { status: 500 });
    }

    // Default to fallback voices immediately.
    // Only overwrite if API succeeds.
    let voices: any[] = FALLBACK_VOICES;
    let source = 'fallback';

    try {
        // Attempt to hit the endpoint
        const voicesRes = await axios.get(`${VAPI_BASE_URL}/voice`, {
            headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` }
        });

        if (voicesRes.status === 200 && Array.isArray(voicesRes.data)) {
            voices = voicesRes.data;
            source = 'api';
        } else {
            console.warn(`VAPI /voice returned ${voicesRes.status}, keeping fallback list.`);
        }
    } catch (error: any) {
        // Log the error but suppress it so we use fallback
        console.warn("VAPI /voice API call failed (expected if endpoint is 404). Using fallback list.", error.message);
        // voices remains FALLBACK_VOICES
    }

    let addedCount = 0;
    let updatedCount = 0;

    for (const voice of voices) {
        // VAPI returns objects like { id: '...', name: '...', provider: '...' }
        const type = 'voice';
        const value = voice.id; // The ID used in the API
        const name = `${voice.name} (${voice.provider})`;
        const provider = voice.provider;
        const costPerUnit = voice.cost || 0.05; // Use enrichment or default

        // Upsert
        const existing = await prisma.providerModel.findUnique({
            where: { type_value: { type, value } }
        });

        if (existing) {
            // Update name/provider/cost if changed
            // Also enable them if they are in our fallback list (trusted standard voices)
            await prisma.providerModel.update({
                where: { id: existing.id },
                data: {
                    name,
                    provider,
                    costPerUnit,
                    // If we are using fallback list (which implies these are standard known voices), enable them for tenants
                    isEnabled: source === 'fallback' ? true : existing.isEnabled
                }
            });
            updatedCount++;
        } else {
            // Insert new
            // Enable by default if coming from our trusted fallback list
            await prisma.providerModel.create({
                data: {
                    type,
                    name,
                    value,
                    provider,
                    costPerUnit,
                    isEnabled: source === 'fallback' ? true : false
                }
            });
            addedCount++;
        }
    }

    // Sync Models explicitly (since Vapi doesn't have a clean dynamic endpoint for them yet)
    for (const model of FALLBACK_MODELS) {
        const type = 'model';
        const value = model.id;
        const name = model.name;
        const provider = model.provider;
        const costPerUnit = model.cost;

        const existing = await prisma.providerModel.findUnique({
            where: { type_value: { type, value } }
        });

        if (existing) {
            await prisma.providerModel.update({
                where: { id: existing.id },
                data: { name, provider, costPerUnit }
            });
            updatedCount++;
        } else {
            await prisma.providerModel.create({
                data: { type, name, value, provider, costPerUnit, isEnabled: true }
            });
            addedCount++;
        }
    }

    return NextResponse.json({ success: true, added: addedCount, updated: updatedCount, source });

  } catch (error: any) {
    console.error("Sync Error:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
