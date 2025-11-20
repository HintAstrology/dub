import { EAnalyticEvents } from "../interfaces/analytic.interface.ts";

interface ITrackMixpanelApiProps {
  userId: string;
  values: Record<string, any>;
}

export const addMixpanelPropertyApiService = async ({
  userId,
  values,
}: ITrackMixpanelApiProps) => {
  const mixpanelResponse = await fetch("https://api.mixpanel.com/engage?ip=0#profile-set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        $token: process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
        $distinct_id: userId,
        $set: {
          ...values,
        }
      },
    ]),
  });

  return mixpanelResponse;
};
