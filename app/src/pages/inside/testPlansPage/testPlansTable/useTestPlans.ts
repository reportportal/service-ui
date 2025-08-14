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

import { useState, useEffect } from 'react';
import { TestPlan } from './types';
import { mockedTestPlans } from './mockData';

export const useTestPlans = () => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate data loading
  useEffect(() => {
    const loadTestPlans = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, use mock data
      // In real implementation, you would fetch from API
      setTestPlans(mockedTestPlans);
      setLoading(false);
    };

    void loadTestPlans();
  }, []);

  return {
    testPlans,
    loading,
  };
};
