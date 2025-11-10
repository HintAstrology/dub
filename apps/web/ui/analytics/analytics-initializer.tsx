'use client';

import { growthBookConfig } from 'core/integration/growthbook';
import { authorizedFlowExperiments, EGBExperiments, publicFlowExperiments } from 'core/integration/growthbook/experiments';
import { useEffect } from 'react';

interface AnalyticInitializerProps {
  user?: { id: string } | null;
  sessionId?: string;
}

export const AnalyticInitializer = ({ 
  user, 
  sessionId 
}: AnalyticInitializerProps) => {
  
  useEffect(() => {
    const initExperiments = async () => {
      const gb = await growthBookConfig();
      
      const userId = user?.id || sessionId;
      await gb.setAttributes({ 
        id: userId,
        isAuthorized: !!user,
      });

      const experimentsToInit = user 
        ? authorizedFlowExperiments 
        : publicFlowExperiments;

      experimentsToInit.reduce((acc, expKey) => {
        const value = gb.getFeatureValue(expKey, 'control');
        acc[expKey] = value;
        return acc;
      }, {} as Record<EGBExperiments, string>);

      gb.destroy();
    };

    initExperiments();
  }, [user, sessionId]);

  return null;
};