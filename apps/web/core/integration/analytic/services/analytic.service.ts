import { Dict } from "mixpanel-browser";
import { debugUtil } from "../../../util";
import { ICustomerBody } from "../../payment/config";
import { getUTMList } from "../helpers/get-utms.helper.ts";
import { EAnalyticEvents } from "../interfaces/analytic.interface.ts";
import { mixpanelClient } from "../mixpanel";

declare global {
  interface Window {
    gtag: (
      command: string,
      commandName: string,
      params?: unknown,
      callback?: (str: string) => void,
    ) => void;
  }
}

// interface
interface TrackClientEventsParams<T> {
  event: EAnalyticEvents;
  sessionId?: string;
  user?: ICustomerBody | null;
  params?: T;
}

// init people analytic
export const initPeopleAnalytic = (sessionId: string) => {
  mixpanelClient.identify(sessionId);
};

// set people once
export const setPeopleAnalyticOnce = (value: Dict) => {
  mixpanelClient.peopleSetOnce(value);
};

// set people
export const setPeopleAnalytic = (value: Dict) => {
  mixpanelClient.peopleSet(value);
};

// reset session
export const resetAnalyticSession = () => {
  mixpanelClient.reset();
};

// get distinct id
export const getDistinctId = () => {
  return mixpanelClient.peopleGetDistinctId();
};

// start session recording
export const startSessionRecording = () => {
  return mixpanelClient.startSessionRecording();
};

// stop session recording
export const stopSessionRecording = () => {
  return mixpanelClient.stopSessionRecording();
};

// track events service
export const trackClientEvents = <T extends Dict>(
  props: TrackClientEventsParams<T>,
) => {
  const { event, user, sessionId, params } = props;

  const utm = getUTMList();

  const values = {
    env: `${process.env.NEXT_PUBLIC_APP_ENV}`,
    event_origin: "client",
    mixpanel_user_id: sessionId || user?.id || getDistinctId(),
    locale: "en",
    ...utm,
    ...params,
  };

  if (typeof window !== "undefined") {
    debugUtil({ text: `Event - ${event}`, value: values });

    mixpanelClient.track({ eventName: event, props: values });
    window?.gtag("event", event, values);
  } else {
    console.error({
      text: `Event ${event}`,
      value: "Mixpanel or Gtag is not available on window.",
    });
  }
};
