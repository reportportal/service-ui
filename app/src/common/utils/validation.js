export const getTrimValue = (value) => (typeof value === 'string' ? value.trim() : value);
export const isEmpty = (value) => !getTrimValue(value);
export const email = (emailValue) =>
  !!/^[a-z0-9.+_-]+@[a-z0-9_.-]+?\.[a-z0-9]{2,}$/i.exec(emailValue);
export const password = (passwordValue) => !!/^(.){4,256}$/.exec(passwordValue);
export const login = (loginValue) => !!/^[0-9a-zA-Z-_.]{1,128}$/.exec(loginValue);
export const name = (nameValue) =>
  getTrimValue(nameValue).length >= 3 && !!/^[a-z0-9._\-\s\u0400-\u04FF]{3,256}$/i.exec(nameValue);

export const minShouldMatch = (minShouldMatchValue) =>
  /^([5-9][0-9])$|^100$/.exec(minShouldMatchValue);
export const minTermFreq = (minTermFreqValue) => /^[1-9]$|^10$/.exec(minTermFreqValue);
export const minDocFreq = (minDocFreqValue) => /^[1-9]$|^10$/.exec(minDocFreqValue);

export const filterName = (value) => getTrimValue(value).length >= 3 && value.length <= 128;
export const launchName = (value) => !isEmpty(value) && value.length <= 256;
export const launchDescription = (value = '') => value.length >= 0 && value.length <= 1024;
export const dashboardName = (value) => getTrimValue(value).length >= 3 && value.length <= 128;
export const widgetName = (value) =>
  !isEmpty(value) && getTrimValue(value).length >= 3 && value.length <= 128;
export const itemNameEntity = (value) => getTrimValue(value).length >= 3 && value.length <= 256;
export const launchNumericEntity = (value) =>
  value.length >= 1 && value.length <= 18 && !!value.match(/^[0-9]+$/);
export const descriptionEntity = (value) => getTrimValue(value).length >= 3 && value.length <= 18;
export const inRangeValidate = (value, min, max) => Number(value) >= min && Number(value) <= max;
export const attributeKey = (value) =>
  !isEmpty(value) && getTrimValue(value).length >= 1 && value.length <= 128;
export const attributesArray = (value) =>
  !value ||
  !value.length ||
  value.every((attribute) => attributeKey(attribute.value) && !attribute.edited);
export const url = (urlValue) => !!/^(ftp|http|https):\/\/[^ "]+$/.exec(urlValue);
export const issueId = (value) => getTrimValue(value).length >= 1 && value.length <= 128;
export const urlPart = (value) => !!/:\/\/.+/.exec(value);
export const projectNumericEntity = (value) => !isEmpty(value) && !!value.match(/^[0-9]+$/);
export const defectTypeLongName = (value) => getTrimValue(value).length >= 3 && value.length <= 55;
export const defectTypeShortName = (value) => getTrimValue(value).length >= 1 && value.length <= 4;
export const projectName = (value) => !!/^[0-9a-zA-Z-_]{3,256}$/.exec(value);
export const btsProject = (value) => getTrimValue(value).length >= 1 && value.length <= 55;
export const patternNameLength = (value) => getTrimValue(value).length >= 1 && value.length <= 55;
export const patternNameUnique = (newPatternName, patternId, patterns) =>
  !patterns.some(({ id, name: patternName }) => patternName === newPatternName && id !== patternId);
export const validateSearchFilter = (filter) => !filter || getTrimValue(filter).length >= 3;
