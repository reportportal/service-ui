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

import { useCallback, useRef } from 'react';

interface ProgressSimulation {
  interval: ReturnType<typeof setInterval>;
  timeout: ReturnType<typeof setTimeout>;
}

interface StartSimulationProps {
  fileId: string;
  duration?: number;
  intervalMs?: number;
  onProgressUpdate: (fileId: string) => void;
  onComplete: (fileId: string) => void;
}

export const useFileUploadProgressSimulation = () => {
  const activeSimulationsRef = useRef<Record<string, ProgressSimulation | undefined>>({});

  const startSimulation = useCallback(
    ({
      fileId,
      duration = 3000,
      intervalMs = 50,
      onComplete,
      onProgressUpdate,
    }: StartSimulationProps) => {
      const interval = setInterval(() => onProgressUpdate(fileId), intervalMs);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        activeSimulationsRef.current[fileId] = undefined;
        onComplete(fileId);
      }, duration);

      activeSimulationsRef.current[fileId] = { interval, timeout };
    },
    [],
  );

  const stopSimulation = useCallback((fileId: string) => {
    const activeSimulation = activeSimulationsRef.current[fileId];

    if (activeSimulation) {
      clearInterval(activeSimulation.interval);
      clearTimeout(activeSimulation.timeout);
      activeSimulationsRef.current[fileId] = undefined;
    }
  }, []);

  const stopAllSimulations = useCallback(() => {
    Object.keys(activeSimulationsRef.current).forEach((fileId) => {
      stopSimulation(fileId);
    });
  }, [stopSimulation]);

  return {
    startSimulation,
    stopSimulation,
    stopAllSimulations,
  };
};
