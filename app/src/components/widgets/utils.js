import { formatAttribute } from 'common/utils';

export const cumulativeFormatParams = (params = {}) => ({
  attributes: (params.attributes || []).map(formatAttribute).join(','),
});

export const topPatternsFormatParams = (params = {}) =>
  params.patternTemplateName
    ? {
        patternTemplateName: params.patternTemplateName,
      }
    : {};

export const componentHealthCheckParams = (params = {}) => ({
  attributes: (params.attributes || []).join(','),
});
