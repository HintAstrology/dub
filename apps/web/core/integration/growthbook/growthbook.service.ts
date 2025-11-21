'use client'

import { configureCache, GrowthBook, setPolyfills } from '@growthbook/growthbook';

export const growthBookConfig = async () => {
  setPolyfills({
    fetch: (url: Parameters<typeof fetch>[0], opts: Parameters<typeof fetch>[1]) =>
      fetch(url, {
        ...opts,
        next: { revalidate: 60, tags: ['growthbook'] },
      }),
  });
  
  configureCache({ disableCache: true });

  const gb = new GrowthBook({
    apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST!,
    clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY!,
    enableDevMode: process.env.NODE_ENV !== 'production',
    trackingCallback: (experiment, result) => {
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'experimentViewed',
          experiment_id: experiment.key,
          variation_id: result.key,
        });
      }
    },
  });
  await gb.init({ timeout: 1000 });
  return gb;
};

export const growthBookGetValue = async <T>(
  props: { atr: { [key: string]: string }; value: string },
  fallback: string | number | boolean = 'fallback',
) => {
  const gb = await growthBookConfig();
  await gb.setAttributes(props.atr);
  const value = gb.getFeatureValue<T>(props.value, fallback as T);
  gb.destroy();
  return value;
};