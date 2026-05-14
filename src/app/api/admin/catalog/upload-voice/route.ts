import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const maxDuration = 300; // Allow for long-running file uploads (5 mins)

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const value = formData.get('value') as string;
    const isStaffTwin = formData.get('isStaffTwin') === 'true';
    const costPerUnit = parseFloat(formData.get('costPerUnit') as string);
    const engineType = formData.get('engineType') as 'piper' | 'kokoro';

    const modelFile = formData.get('modelFile') as File;
    const configFile = formData.get('configFile') as File | null;

    if (!name || !value || isNaN(costPerUnit) || !modelFile) {
      return NextResponse.json({ error: 'Missing required fields or files' }, { status: 400 });
    }

    if (engineType === 'piper' && !configFile) {
      return NextResponse.json({ error: 'Config file is required for Piper engine' }, { status: 400 });
    }

    // Prepare data for Render TTS server
    const renderFormData = new FormData();
    renderFormData.append('voice_id', value);
    renderFormData.append('model_file', modelFile);
    if (configFile) {
      renderFormData.append('config_file', configFile);
    }

    const renderUrl = process.env.RENDER_TTS_URL;
    const renderSecret = process.env.RENDER_TTS_SECRET;

    if (!renderUrl || !renderSecret) {
      console.error('RENDER_TTS_URL or RENDER_TTS_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Proxy the files to Render
    const renderRes = await fetch(`${renderUrl}/admin/upload-model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${renderSecret}`
      },
      body: renderFormData
    });

    if (!renderRes.ok) {
      const errorText = await renderRes.text();
      console.error('Render upload failed:', errorText);
      return NextResponse.json({ error: `Failed to upload to Render: ${errorText}` }, { status: renderRes.status });
    }

    // Create or Update record in Prisma (Upsert)
    const newVoice = await prisma.providerModel.upsert({
      where: {
        type_value: {
          type: 'voice',
          value: value
        }
      },
      update: {
        name,
        costPerUnit,
        provider: isStaffTwin ? 'staff-twin' : 'custom-render',
        isEnabled: true
      },
      create: {
        type: 'voice',
        provider: isStaffTwin ? 'staff-twin' : 'custom-render',
        name,
        value,
        costPerUnit,
        isEnabled: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Voice model uploaded and catalog updated',
      voice: newVoice
    });

  } catch (error: any) {
    console.error('Upload voice route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
