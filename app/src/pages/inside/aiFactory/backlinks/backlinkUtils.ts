/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { EntityWithDisplayId } from 'types/common';

interface AttributeLike {
  key?: unknown;
  value?: unknown;
}

export interface PipelineIterationIdentity {
  pipelineId: number;
  iterationId: number;
}

const PIPELINE_ATTRIBUTE_KEY = 'pipeline';
const PIPELINE_IDENTITY_PATTERN = /^([1-9]\d*)\/([1-9]\d*)$/;

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export const parseTestCaseIdentity = (value: unknown): EntityWithDisplayId | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { id, displayId } = value as { id?: unknown; displayId?: unknown };

  if (!isPositiveSafeInteger(id) || typeof displayId !== 'string' || !displayId.trim().length) {
    return null;
  }

  return { id, displayId };
};

export const parsePipelineIterationIdentity = (
  attributes: unknown,
): PipelineIterationIdentity | null => {
  if (!Array.isArray(attributes)) {
    return null;
  }

  const pipelineAttributes = attributes.filter(
    (attribute): attribute is AttributeLike =>
      Boolean(attribute) &&
      typeof attribute === 'object' &&
      (attribute as AttributeLike).key === PIPELINE_ATTRIBUTE_KEY,
  );

  if (pipelineAttributes.length !== 1 || typeof pipelineAttributes[0].value !== 'string') {
    return null;
  }

  const match = pipelineAttributes[0].value.match(PIPELINE_IDENTITY_PATTERN);
  if (!match) {
    return null;
  }

  const pipelineId = Number(match[1]);
  const iterationId = Number(match[2]);

  return isPositiveSafeInteger(pipelineId) && isPositiveSafeInteger(iterationId)
    ? { pipelineId, iterationId }
    : null;
};
