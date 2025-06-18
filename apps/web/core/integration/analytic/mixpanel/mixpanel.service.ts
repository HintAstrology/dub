import mixpanel, { Dict } from 'mixpanel-browser';

// interface
interface ITrackParams {
  eventName: string;
  props?: Dict;
}

// mixpanel client service
class MixpanelClientService {
  constructor() {
    mixpanel.init(`${process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN}`, {
      debug: process.env.NODE_ENV !== 'production',
      track_pageview: false,
      persistence: 'localStorage',
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
}

const mixpanelClient = new MixpanelClientService();

export default mixpanelClient;
