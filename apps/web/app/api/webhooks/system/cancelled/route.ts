import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@dub/prisma';
import { CUSTOMER_IO_TEMPLATES, sendEmail } from '@dub/email';
import { format } from 'date-fns';
import { trackMixpanelApiService } from 'core/integration/analytic/services/track-mixpanel-api.service';
import { EAnalyticEvents } from 'core/integration/analytic/interfaces/analytic.interface';

interface IDataRes {
  success: boolean;
  error?: string | null;
  code?: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse<IDataRes>> {
  try {
    const body = await req.json();

    console.log('cancelled');
    console.log(body);

    const email = body.subscription?.attributes?.email || body.user?.email;
    const changeType = body.type;

    if (changeType !== 'cancelled') {
      return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });
  
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    await trackMixpanelApiService({
      event: EAnalyticEvents.CANCELLED,
      params: {},
      email: user.email!,
      userId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
