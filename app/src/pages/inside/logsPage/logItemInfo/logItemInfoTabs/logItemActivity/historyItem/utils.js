const parseRelaxed = (value) => {
  const objKeysSelectRegex = /([{,])(?:\s*)(?:')?([A-Za-z_$.][A-Za-z0-9_ \-.$]*)(?:')?(?:\s*):/g;
  const quotedKeysValue = value.replace(objKeysSelectRegex, '$1"$2":');
  return JSON.parse(quotedKeysValue);
};

export const normalizeAndParse = (value) => {
  const regex = /{.*}$/;
  const substitutions = { '=': ':', "'": '"' };
  const normalized =
    (value && value.match(regex)[0].replace(/[=']/g, (char) => substitutions[char])) || '{}';
  return parseRelaxed(normalized);
};
