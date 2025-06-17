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
    priority: 'high',
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
    priority: 'normal',
    tags: [],
    lastExecution: 'Yesterday',
  },
  {
    id: 3,
    name: 'Account Access Verification Delta',
    priority: 'low',
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
    priority: 'high',
    tags: [],
    lastExecution: 'last month',
  },
  {
    id: 5,
    name: 'Credential Submission Assessment Epsilon',
    priority: 'high',
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
    priority: 'normal',
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
    priority: 'normal',
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
    priority: 'low',
    tags: ['navigation', 'ui', 'dashboard', 'user flow'],
    lastExecution: '1 hour ago',
  },
  {
    id: 9,
    name: 'Data Export Functionality Verification',
    priority: 'high',
    tags: ['export', 'data processing', 'file handling', 'performance'],
    lastExecution: '5 days ago',
  },
  {
    id: 10,
    name: 'Mobile Responsive Design Check',
    priority: 'normal',
    tags: ['mobile', 'responsive', 'css', 'media queries', 'cross-device'],
    lastExecution: '12 hours ago',
  },
  {
    id: 11,
    name: 'API Integration Security Test',
    priority: 'high',
    tags: ['api', 'security', 'authentication', 'authorization', 'oauth'],
    lastExecution: '1 week ago',
  },
  {
    id: 12,
    name: 'Database Connection Stability',
    priority: 'high',
    tags: ['database', 'connection', 'stability', 'performance'],
    lastExecution: '30 minutes ago',
  },
  {
    id: 13,
    name: 'Payment Gateway Integration',
    priority: 'high',
    tags: ['payment', 'gateway', 'integration', 'transaction', 'security'],
    lastExecution: '2 hours ago',
  },
  {
    id: 14,
    name: 'Email Notification System',
    priority: 'normal',
    tags: ['email', 'notification', 'smtp', 'template'],
    lastExecution: '6 hours ago',
  },
  {
    id: 15,
    name: 'File Upload Size Validation',
    priority: 'low',
    tags: ['file upload', 'validation', 'size limit', 'error handling'],
    lastExecution: '1 day ago',
  },
  {
    id: 16,
    name: 'Search Filter Performance',
    priority: 'normal',
    tags: ['search', 'filter', 'performance', 'optimization', 'indexing'],
    lastExecution: '3 hours ago',
  },
  {
    id: 17,
    name: 'User Profile Update Workflow',
    priority: 'low',
    tags: ['profile', 'update', 'user management', 'validation'],
    lastExecution: '8 hours ago',
  },
  {
    id: 18,
    name: 'Multi-language Support Test',
    priority: 'low',
    tags: ['i18n', 'localization', 'language', 'translation'],
    lastExecution: '2 weeks ago',
  },
  {
    id: 19,
    name: 'Shopping Cart Persistence',
    priority: 'normal',
    tags: ['shopping cart', 'persistence', 'session', 'local storage'],
    lastExecution: '45 minutes ago',
  },
  {
    id: 20,
    name: 'Social Media Login Integration',
    priority: 'normal',
    tags: ['social login', 'oauth', 'facebook', 'google', 'integration'],
    lastExecution: '4 hours ago',
  },
  {
    id: 21,
    name: 'Report Generation Performance',
    priority: 'normal',
    tags: ['reports', 'generation', 'performance', 'pdf', 'excel'],
    lastExecution: '1 day ago',
  },
  {
    id: 22,
    name: 'Real-time Chat Functionality',
    priority: 'high',
    tags: ['chat', 'real-time', 'websocket', 'messaging'],
    lastExecution: '2 hours ago',
  },
  {
    id: 23,
    name: 'Backup System Reliability',
    priority: 'high',
    tags: ['backup', 'reliability', 'data recovery', 'system'],
    lastExecution: '12 hours ago',
  },
  {
    id: 24,
    name: 'Browser Compatibility Check',
    priority: 'low',
    tags: ['browser', 'compatibility', 'cross-browser', 'testing'],
    lastExecution: '3 days ago',
  },
  {
    id: 25,
    name: 'Load Balancer Configuration',
    priority: 'high',
    tags: ['load balancer', 'configuration', 'scaling', 'performance'],
    lastExecution: '1 hour ago',
  },
  {
    id: 26,
    name: 'User Session Management',
    priority: 'normal',
    tags: ['session', 'management', 'timeout', 'security'],
    lastExecution: '5 hours ago',
  },
  {
    id: 27,
    name: 'Content Management System',
    priority: 'normal',
    tags: ['cms', 'content', 'management', 'editor', 'publishing'],
    lastExecution: '7 hours ago',
  },
  {
    id: 28,
    name: 'Image Processing Pipeline',
    priority: 'low',
    tags: ['image', 'processing', 'pipeline', 'optimization', 'resize'],
    lastExecution: '9 hours ago',
  },
  {
    id: 29,
    name: 'Third-party API Rate Limiting',
    priority: 'normal',
    tags: ['api', 'rate limiting', 'third-party', 'throttling'],
    lastExecution: '1 week ago',
  },
  {
    id: 30,
    name: 'Data Synchronization Process',
    priority: 'high',
    tags: ['data sync', 'synchronization', 'consistency', 'replication'],
    lastExecution: '20 minutes ago',
  },
  {
    id: 31,
    name: 'Security Vulnerability Scan',
    priority: 'high',
    tags: ['security', 'vulnerability', 'scan', 'penetration testing'],
    lastExecution: '2 days ago',
  },
  {
    id: 32,
    name: 'Microservices Communication',
    priority: 'normal',
    tags: ['microservices', 'communication', 'service mesh', 'api gateway'],
    lastExecution: '3 hours ago',
  },
  {
    id: 33,
    name: 'Caching Strategy Implementation',
    priority: 'low',
    tags: ['caching', 'strategy', 'redis', 'performance', 'optimization'],
    lastExecution: '6 hours ago',
  },
  {
    id: 34,
    name: 'Machine Learning Model Deployment',
    priority: 'high',
    tags: ['ml', 'model', 'deployment', 'ai', 'prediction'],
    lastExecution: '10 minutes ago',
  },
  {
    id: 35,
    name: 'Kubernetes Cluster Health Check',
    priority: 'high',
    tags: ['kubernetes', 'cluster', 'health', 'monitoring', 'devops'],
    lastExecution: '1 hour ago',
  },
];

export const STATUS_TYPES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const;

export const ITEMS_PER_PAGE_OPTIONS: number[] = [10, 25, 50, 100];

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Low Priority', value: STATUS_TYPES.LOW },
  { label: 'Normal Priority', value: STATUS_TYPES.NORMAL },
  { label: 'High Priority', value: STATUS_TYPES.HIGH },
];
