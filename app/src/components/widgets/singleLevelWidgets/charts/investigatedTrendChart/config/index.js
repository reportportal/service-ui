import { getLaunchModeConfig } from './launchModeConfig';
import { getTimelineConfig } from './timelineConfig';

export const getConfig = (params, isTimeline) =>
  isTimeline ? getTimelineConfig(params) : getLaunchModeConfig(params);
