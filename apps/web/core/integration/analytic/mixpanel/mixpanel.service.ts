import mixpanel, { Dict } from "mixpanel-browser";

// interface
interface ITrackParams {
  eventName: string;
  props?: Dict;
}

// mixpanel client service
class MixpanelClientService {
  constructor() {
    mixpanel.init(`${process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN}`, {
      debug: process.env.NODE_ENV !== "production",
      track_pageview: false,
      persistence: "localStorage",
      record_heatmap_data: true,
      // record_sessions_percent: 1, // Session Replay enabled, recording 1% of all sessions
      // api_host: `${process.env.NEXT_PUBLIC_MIXPANEL_API_HOST}`,
    });
  }

  identify(id: string) {
    mixpanel.identify(id);
  }

  peopleSetOnce(value: Dict) {
    mixpanel.people.set_once(value);
  }

  peopleSet(value: Dict) {
    mixpanel.people.set(value);
  }

  reset() {
    mixpanel.reset();
  }

  track(values: ITrackParams) {
    const { eventName, props } = values;

    mixpanel.track(eventName, props);
  }

  peopleGetDistinctId() {
    const distinctId = mixpanel.get_distinct_id();
    if (distinctId) {
      return distinctId.split(":").at(-1);
    }
    return "";
  }

  startSessionRecording() {
    const sessionRecordingProperties =
      mixpanel.get_session_recording_properties();

    if (
      !("$mp_replay_id" in sessionRecordingProperties) ||
      !sessionRecordingProperties.$mp_replay_id
    ) {
      mixpanel.start_session_recording();
    }
  }

  stopSessionRecording() {
    mixpanel.stop_session_recording();
  }
}

const mixpanelClient = new MixpanelClientService();

export default mixpanelClient;
