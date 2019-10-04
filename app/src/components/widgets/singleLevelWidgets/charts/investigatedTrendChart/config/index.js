import { getLaunchModeConfig } from './launchModeConfig';
import { getTimelineConfig } from './timelineConfig';

export const selectConfigFunction = (isTimeline) =>
  isTimeline ? getTimelineConfig : getLaunchModeConfig;
