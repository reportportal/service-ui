/*
 * Copyright 2026 EPAM Systems
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

import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import { getStorageItem, updateStorageItem } from 'common/utils';
import { userIdSelector } from 'controllers/user';

import {
  FOLDER_TREE_DEFAULT_WIDTH,
  FOLDER_TREE_KEYBOARD_STEP,
  FOLDER_TREE_MAX_WIDTH,
  FOLDER_TREE_MIN_WIDTH,
  FOLDER_TREE_WIDTH_SETTINGS_KEY,
} from './constants';

export const clampFolderTreeWidth = (width: number): number =>
  Math.round(Math.min(FOLDER_TREE_MAX_WIDTH, Math.max(FOLDER_TREE_MIN_WIDTH, width)));

const getSettingsKey = (userId: string | undefined) => (userId ? `${userId}_settings` : null);

export const getStoredFolderTreeWidth = (userId: string | undefined): number => {
  const settingsKey = getSettingsKey(userId);
  const settings = settingsKey
    ? (getStorageItem(settingsKey) as Record<string, unknown> | null)
    : null;
  const width = settings?.[FOLDER_TREE_WIDTH_SETTINGS_KEY];

  return typeof width === 'number' && Number.isFinite(width)
    ? clampFolderTreeWidth(width)
    : FOLDER_TREE_DEFAULT_WIDTH;
};

const saveFolderTreeWidth = (userId: string | undefined, width: number) => {
  const settingsKey = getSettingsKey(userId);

  if (settingsKey) {
    updateStorageItem(settingsKey, { [FOLDER_TREE_WIDTH_SETTINGS_KEY]: width });
  }
};

/**
 * Width of the folder tree panel: drag the border (min 360, max 700), double-click resets
 * the default width. The width is remembered per user in the user settings (local storage).
 */
export const useResizableFolderTree = () => {
  const userId = useSelector(userIdSelector) as string | undefined;
  const [storedWidth, setStoredWidth] = useState<{ userId?: string; width: number }>(() => ({
    userId,
    width: getStoredFolderTreeWidth(userId),
  }));
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; width: number } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const savedWidth =
    storedWidth.userId === userId ? storedWidth.width : getStoredFolderTreeWidth(userId);
  const width = dragWidth ?? savedWidth;

  const commitWidth = useCallback(
    (nextWidth: number) => {
      const clampedWidth = clampFolderTreeWidth(nextWidth);

      saveFolderTreeWidth(userId, clampedWidth);
      setStoredWidth({ userId, width: clampedWidth });
    },
    [userId],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      dragStartRef.current = { x: event.clientX, width: savedWidth };
      setDragWidth(savedWidth);

      const { body } = document;
      const previousCursor = body.style.cursor;
      const previousUserSelect = body.style.userSelect;

      body.style.cursor = 'col-resize';
      body.style.userSelect = 'none';

      const getWidth = (clientX: number) =>
        clampFolderTreeWidth(
          (dragStartRef.current?.width ?? savedWidth) +
            clientX -
            (dragStartRef.current?.x ?? clientX),
        );

      const handlePointerMove = (moveEvent: PointerEvent) => {
        setDragWidth(getWidth(moveEvent.clientX));
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        body.style.cursor = previousCursor;
        body.style.userSelect = previousUserSelect;
        cleanupRef.current = null;
      };

      function handlePointerUp(upEvent: PointerEvent) {
        commitWidth(getWidth(upEvent.clientX));
        setDragWidth(null);
        dragStartRef.current = null;
        cleanup();
      }

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      cleanupRef.current = cleanup;
    },
    [savedWidth, commitWidth],
  );

  const handleDoubleClick = useCallback(() => {
    commitWidth(FOLDER_TREE_DEFAULT_WIDTH);
  }, [commitWidth]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const steps: Record<string, number> = {
        ArrowLeft: -FOLDER_TREE_KEYBOARD_STEP,
        ArrowRight: FOLDER_TREE_KEYBOARD_STEP,
      };

      if (event.key in steps) {
        event.preventDefault();
        commitWidth(savedWidth + steps[event.key]);
      } else if (event.key === 'Home') {
        event.preventDefault();
        commitWidth(FOLDER_TREE_MIN_WIDTH);
      } else if (event.key === 'End') {
        event.preventDefault();
        commitWidth(FOLDER_TREE_MAX_WIDTH);
      }
    },
    [savedWidth, commitWidth],
  );

  return {
    width,
    isResizing: dragWidth !== null,
    handlePointerDown,
    handleDoubleClick,
    handleKeyDown,
  };
};
