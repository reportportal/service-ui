/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { formatDistanceToNow, format } from 'date-fns';
import { enUS, ru, es, de } from 'date-fns/locale';
import { TestCaseMenuAction } from 'pages/inside/testCaseLibraryPage/testCaseList/types';

const dateFnsLocales: Record<string, Locale> = {
  en: enUS,
  'en-US': enUS,
  ru,
  es,
  de,
};

type PermissionMapEntry = {
  isAllowed: boolean;
  action: TestCaseMenuAction;
};

/**
 * Formats a timestamp in milliseconds to a readable date-time string using date-fns
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted date string in YYYY-MM-DD HH:MM:SS format
 */
export const formatTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
};

/**
 * Formats duration in milliseconds to a human-readable string
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string (e.g., "16min", "1h 5min", "2h")
 */
export const formatDuration = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours}h`;
  }
  return `${minutes} min`;
};

/**
 * Formats a timestamp to relative time using date-fns for better accuracy and internationalization support
 * @param timestamp - Timestamp in milliseconds
 * @param locale - Optional locale for internationalization (defaults to English)
 * @returns Formatted relative time string (e.g., "2 days ago", "about 1 hour ago")
 */
export const formatRelativeTime = (timestamp: number, locale = 'enUS'): string => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    includeSeconds: true,
    locale: dateFnsLocales[locale],
  });
};

export const getExcludedActionsFromPermissionMap = (
  permissionMap: PermissionMapEntry[],
): TestCaseMenuAction[] =>
  permissionMap.filter(({ isAllowed }) => !isAllowed).map(({ action }) => action);
