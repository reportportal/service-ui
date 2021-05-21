export const escapeBackslashes = (input = '') => String(input).replace(/\\/gm, '\\\\');

export const escapeTestItemStringContent = (items) =>
  items.map((item) => ({
    ...item,
    name: escapeBackslashes(item.name),
    codeRef: escapeBackslashes(item.codeRef),
    description: escapeBackslashes(item.description),
    testCaseId: escapeBackslashes(item.testCaseId),
  }));
