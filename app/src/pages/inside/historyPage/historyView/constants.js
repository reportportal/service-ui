export const CELL_PREVIEW_DEFECT_TYPE = 'defectType';
export const CELL_PREVIEW_ATTRIBUTE = 'attribute';
export const CELL_PREVIEW_DEFAULT_VALUE = CELL_PREVIEW_DEFECT_TYPE;

export const CELL_PREVIEW_CONFIG = {
  name: 'cellPreview',
  defaultValue: CELL_PREVIEW_DEFAULT_VALUE,
  options: [
    { value: CELL_PREVIEW_DEFECT_TYPE, label: 'Defect Type' },
    { value: CELL_PREVIEW_ATTRIBUTE, label: 'Attribute' },
  ],
};

export const ATTRIBUTE_KEY_CONFIG = {
  name: 'attributeKey',
  defaultValue: '',
};

export const HIGHLIGHT_LESS_THAN_CONFIG = {
  name: 'highlightLessThan',
  defaultValue: '',
};

export const CELL_HIGHLIGHT_COLORS = {
  DEFAULT: '#E3E7EC',
  BELOW_THRESHOLD: '#FFC0BD',
  ABOVE_THRESHOLD: '#56b985',
};
