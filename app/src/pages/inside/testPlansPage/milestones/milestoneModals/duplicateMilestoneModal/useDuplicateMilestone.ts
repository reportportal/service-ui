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

import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';

import { useMilestoneSubmit } from '../useMilestoneSubmit';

import type { UseDuplicateMilestoneParams } from './types';

export const useDuplicateMilestone = ({ sourceMilestoneId }: UseDuplicateMilestoneParams) => {
  const projectKey = useSelector(projectKeySelector);

  const { isLoading, submit } = useMilestoneSubmit({
    url: URLS.tmsMilestoneDuplicate(projectKey, sourceMilestoneId),
    method: 'post',
    successMessageId: 'milestoneDuplicatedSuccess',
  });

  return {
    isLoading,
    submitDuplicate: submit,
  };
};
