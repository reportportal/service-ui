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

import { TestCase, FilterOption } from './types';

export const mockTestCases: TestCase[] = [
  {
    id: 1,
    name: 'User Authentication Scenario Alpha',
    status: 'passed',
    tags: [
      'sso system',
      'user interface improvements',
      'battery usage analysis for a',
      'cross-platform app speed t',
      'ui',
      'performance test',
      'security check',
      'user flow',
    ],
    lastExecution: '2 weeks ago',
  },
  {
    id: 2,
    name: 'Login Functionality Check Beta',
    status: 'passed',
    tags: [],
    lastExecution: 'Yesterday',
  },
  {
    id: 3,
    name: 'Account Access Verification Delta',
    status: 'failed',
    tags: [
      'sso system',
      'user interface improvements',
      'battery usage analysis for a',
      'cross-platform app speed t',
      'ui',
    ],
    lastExecution: '3 days ago',
  },
  {
    id: 4,
    name: 'User Sign-In Validation Process for Gamma Systems',
    status: 'failed',
    tags: [],
    lastExecution: 'last month',
  },
  {
    id: 5,
    name: 'Credential Submission Assessment Epsilon',
    status: 'failed',
    tags: [
      'ai bug',
      'performance test',
      'security check',
      'user flow',
      'api validation',
      'data integrity',
      'cross-browser',
      'accessibility',
      'regression',
      'smoke test',
      'load test',
      'integration',
      'end-to-end',
      'user acceptance',
      'functionality',
    ],
    lastExecution: '4 days ago',
  },
  {
    id: 6,
    name: 'Login Process Evaluation Zeta',
    status: 'passed',
    tags: [
      'sso system',
      'user interface improvements',
      'battery usage analysis for a',
      'cross-platform app speed t',
      'ui',
    ],
    lastExecution: 'Yesterday',
  },
  {
    id: 7,
    name: 'User Entry Confirmation Eta',
    status: 'passed',
    tags: [
      'sso system',
      'user interface improvements',
      'battery usage analysis for speed',
      'cross-platform app speed t',
      'ui',
    ],
    lastExecution: '2 days ago',
  },
  {
    id: 8,
    name: 'Dashboard Navigation Flow Test',
    status: 'passed',
    tags: ['navigation', 'ui', 'dashboard', 'user flow'],
    lastExecution: '1 hour ago',
  },
  {
    id: 9,
    name: 'Data Export Functionality Verification',
    status: 'failed',
    tags: ['export', 'data processing', 'file handling', 'performance'],
    lastExecution: '5 days ago',
  },
  {
    id: 10,
    name: 'Mobile Responsive Design Check',
    status: 'passed',
    tags: ['mobile', 'responsive', 'css', 'media queries', 'cross-device'],
    lastExecution: '12 hours ago',
  },
  {
    id: 11,
    name: 'API Integration Security Test',
    status: 'skipped',
    tags: ['api', 'security', 'authentication', 'authorization', 'oauth'],
    lastExecution: '1 week ago',
  },
  {
    id: 12,
    name: 'Database Connection Stability',
    status: 'in_progress',
    tags: ['database', 'connection', 'stability', 'performance'],
    lastExecution: '30 minutes ago',
  },
  {
    id: 13,
    name: 'Payment Gateway Integration',
    status: 'failed',
    tags: ['payment', 'gateway', 'integration', 'transaction', 'security'],
    lastExecution: '2 hours ago',
  },
  {
    id: 14,
    name: 'Email Notification System',
    status: 'passed',
    tags: ['email', 'notification', 'smtp', 'template'],
    lastExecution: '6 hours ago',
  },
  {
    id: 15,
    name: 'File Upload Size Validation',
    status: 'passed',
    tags: ['file upload', 'validation', 'size limit', 'error handling'],
    lastExecution: '1 day ago',
  },
  {
    id: 16,
    name: 'Search Filter Performance',
    status: 'failed',
    tags: ['search', 'filter', 'performance', 'optimization', 'indexing'],
    lastExecution: '3 hours ago',
  },
  {
    id: 17,
    name: 'User Profile Update Workflow',
    status: 'passed',
    tags: ['profile', 'update', 'user management', 'validation'],
    lastExecution: '8 hours ago',
  },
  {
    id: 18,
    name: 'Multi-language Support Test',
    status: 'skipped',
    tags: ['i18n', 'localization', 'language', 'translation'],
    lastExecution: '2 weeks ago',
  },
  {
    id: 19,
    name: 'Shopping Cart Persistence',
    status: 'in_progress',
    tags: ['shopping cart', 'persistence', 'session', 'local storage'],
    lastExecution: '45 minutes ago',
  },
  {
    id: 20,
    name: 'Social Media Login Integration',
    status: 'passed',
    tags: ['social login', 'oauth', 'facebook', 'google', 'integration'],
    lastExecution: '4 hours ago',
  },
  {
    id: 21,
    name: 'Report Generation Performance',
    status: 'failed',
    tags: ['reports', 'generation', 'performance', 'pdf', 'excel'],
    lastExecution: '1 day ago',
  },
  {
    id: 22,
    name: 'Real-time Chat Functionality',
    status: 'passed',
    tags: ['chat', 'real-time', 'websocket', 'messaging'],
    lastExecution: '2 hours ago',
  },
  {
    id: 23,
    name: 'Backup System Reliability',
    status: 'passed',
    tags: ['backup', 'reliability', 'data recovery', 'system'],
    lastExecution: '12 hours ago',
  },
  {
    id: 24,
    name: 'Browser Compatibility Check',
    status: 'skipped',
    tags: ['browser', 'compatibility', 'cross-browser', 'testing'],
    lastExecution: '3 days ago',
  },
  {
    id: 25,
    name: 'Load Balancer Configuration',
    status: 'in_progress',
    tags: ['load balancer', 'configuration', 'scaling', 'performance'],
    lastExecution: '1 hour ago',
  },
  {
    id: 26,
    name: 'User Session Management',
    status: 'passed',
    tags: ['session', 'management', 'timeout', 'security'],
    lastExecution: '5 hours ago',
  },
  {
    id: 27,
    name: 'Content Management System',
    status: 'failed',
    tags: ['cms', 'content', 'management', 'editor', 'publishing'],
    lastExecution: '7 hours ago',
  },
  {
    id: 28,
    name: 'Image Processing Pipeline',
    status: 'passed',
    tags: ['image', 'processing', 'pipeline', 'optimization', 'resize'],
    lastExecution: '9 hours ago',
  },
  {
    id: 29,
    name: 'Third-party API Rate Limiting',
    status: 'skipped',
    tags: ['api', 'rate limiting', 'third-party', 'throttling'],
    lastExecution: '1 week ago',
  },
  {
    id: 30,
    name: 'Data Synchronization Process',
    status: 'in_progress',
    tags: ['data sync', 'synchronization', 'consistency', 'replication'],
    lastExecution: '20 minutes ago',
  },
  {
    id: 31,
    name: 'Security Vulnerability Scan',
    status: 'failed',
    tags: ['security', 'vulnerability', 'scan', 'penetration testing'],
    lastExecution: '2 days ago',
  },
  {
    id: 32,
    name: 'Microservices Communication',
    status: 'passed',
    tags: ['microservices', 'communication', 'service mesh', 'api gateway'],
    lastExecution: '3 hours ago',
  },
  {
    id: 33,
    name: 'Caching Strategy Implementation',
    status: 'passed',
    tags: ['caching', 'strategy', 'redis', 'performance', 'optimization'],
    lastExecution: '6 hours ago',
  },
  {
    id: 34,
    name: 'Machine Learning Model Deployment',
    status: 'in_progress',
    tags: ['ml', 'model', 'deployment', 'ai', 'prediction'],
    lastExecution: '10 minutes ago',
  },
  {
    id: 35,
    name: 'Kubernetes Cluster Health Check',
    status: 'passed',
    tags: ['kubernetes', 'cluster', 'health', 'monitoring', 'devops'],
    lastExecution: '1 hour ago',
  },
];

export const STATUS_TYPES = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  IN_PROGRESS: 'in_progress',
} as const;

export const ITEMS_PER_PAGE_OPTIONS: number[] = [10, 25, 50, 100];

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Passed', value: STATUS_TYPES.PASSED },
  { label: 'Failed', value: STATUS_TYPES.FAILED },
  { label: 'Skipped', value: STATUS_TYPES.SKIPPED },
  { label: 'In Progress', value: STATUS_TYPES.IN_PROGRESS },
];
