import { NextResponse } from 'next/server';
import { NhtsaVpicProvider } from '@/lib/providers/nhtsa-vpic';

export const runtime = 'edge';

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ vin: string }> }) {
  const params = await paramsPromise;

  try {
    const result = await NhtsaVpicProvider.fetchDetails!(params.vin);
    return NextResponse.json(result);
  } catch (err: any) {
    return new NextResponse(err?.message ?? 'VIN decode failed', { status: 400 });
  }
}
