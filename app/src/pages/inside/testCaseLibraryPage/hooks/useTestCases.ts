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

import { useState, useEffect, useMemo } from 'react';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { mockTestCases } from 'pages/inside/testCaseLibraryPage/testCaseList';

export const useTestCases = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>('');

  // Simulate data loading
  useEffect(() => {
    const loadTestCases = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, use mock data
      // In real implementation, you would fetch from API
      setTestCases(mockTestCases);
      setLoading(false);
    };

    loadTestCases();
  }, []);

  const filteredTestCases = useMemo(() => {
    if (!searchValue.trim()) {
      return testCases;
    }

    const term = searchValue.toLowerCase();
    return testCases.filter(
      (testCase) =>
        testCase.name.toLowerCase().includes(term) ??
        testCase.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  }, [testCases, searchValue]);

  const hasTestCases = useMemo(() => filteredTestCases && filteredTestCases.length > 0, [
    filteredTestCases,
  ]);

  return {
    testCases,
    filteredTestCases,
    loading,
    hasTestCases,
    searchValue,
    setSearchValue,
  };
};
