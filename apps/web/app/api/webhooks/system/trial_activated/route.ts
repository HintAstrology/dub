import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@dub/prisma';
import { EAnalyticEvents } from 'core/integration/analytic/interfaces/analytic.interface';
import { addMixpanelPropertyApiService } from 'core/integration/analytic/services/add-mixpanel-property-api.service';

interface IDataRes {
  success: boolean;
  error?: string | null;
  code?: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse<IDataRes>> {
  try {
    const body = await req.json();

    console.log('trial_activated');
    console.log(body);

    const email = body.subscription?.attributes?.email || body.user?.email;
    const changeType = body.type;

    if (changeType !== 'trial_activated') {
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

    await addMixpanelPropertyApiService({
      userId: user.id,
      values: {
        trial_activated: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
