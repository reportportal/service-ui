export function combineNameAndEmailToFrom(inputObj) {
  const obj = { ...inputObj };
  if (obj.fromName && obj.fromEmail) {
    obj.from = `${obj.fromName} <${obj.fromEmail}>`;
    delete obj.fromName;
    delete obj.fromEmail;
  }
  return obj;
}

export function separateFromIntoNameAndEmail(inputObj) {
  const obj = { ...inputObj };
  if (obj.from) {
    const match = obj.from.match(/^(.*) <(.*)>$/);
    if (match) {
      obj.fromName = match[1];
      obj.fromEmail = match[2];
    } else {
      obj.fromName = obj.from;
      obj.fromEmail = '';
    }
    delete obj.from;
  } else {
    obj.fromName = '';
    obj.fromEmail = '';
  }
  return obj;
}
