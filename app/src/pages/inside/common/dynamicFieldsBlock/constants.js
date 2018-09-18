export const STRING_FIELDS = {
  issuetype: 'issuetype',
  string: 'string',
  number: 'number',
  Workspace: 'Workspace',
  HierarchicalRequirement: 'HierarchicalRequirement',
  DefectDefectSuitesType: 'DefectDefectSuitesType',
  boolean: 'boolean',
  double: 'double',
  DefectDuplicatesType: 'DefectDuplicatesType',
  TestCaseResult: 'TestCaseResult',
  TestCase: 'TestCase',
  DefectAttachmentsType: 'DefectAttachmentsType',
  ArtifactMilestonesType: 'ArtifactMilestonesType',
  ArtifactChangesetsType: 'ArtifactChangesetsType',
  ArtifactTagsType: 'ArtifactTagsType',
};

const ARRAY_FIELDS = {
  array: 'array',
};

const SELECT_FIELDS = {
  option: 'option',
  priority: 'priority',
  FlowState: 'FlowState',
  User: 'User',
  Release: 'Release',
  Iteration: 'Iteration',
  Project: 'Project',
};

const DATE_FIELDS = {
  date: 'date',
  dateTime: 'dateTime',
};

export const FIELD_TYPES_MAP = {
  stringFields: STRING_FIELDS,
  selectFields: SELECT_FIELDS,
  arrayFields: ARRAY_FIELDS,
  dateFields: DATE_FIELDS,
};

export const DATE_FORMAT = 'YYYY-MM-DD';
