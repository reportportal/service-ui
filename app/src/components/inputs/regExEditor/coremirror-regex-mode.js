/* eslint-disable no-plusplus */
export const regExpMode = () => {
  // eslint-disable-next-line no-useless-escape
  const QUANTIFIERS = /[\^\$\.\+\?\*]/;
  let groupLevel = 0;
  const tokenBase = (stream) => {
    const ch = stream.next();
    switch (ch) {
      case '\\':
        if (stream.match(/./, false)) {
          if (stream.match(/u\w{4}/) || stream.match(/x\w{2}/) || stream.match(/c\w/))
            return 'simbol';
          if (stream.match(/[dDwWsStrnvf0]/)) return 'spec';
          if (stream.match(QUANTIFIERS) || stream.match(/\\/)) return 'escaped';
          return 'simbol';
        }
        break;
      case '{':
        if (stream.match(/(\d+|\d+,\d*)\}/)) return 'quantifier';
        break;
      case '[':
        if (stream.match(/[^\]]+\]/)) return 'range';
        break;
      case '|':
        return `group${groupLevel}`;
      case '(':
        if (stream.match(/[?!:]+/)) return `group${++groupLevel % 5}`;
        break;
      case ')':
        if (groupLevel - 1 < 0) return 'err';
        return `group${groupLevel-- % 5}`;
      default:
        if (QUANTIFIERS.test(ch)) {
          return 'quantifier';
        }
    }
    return '';
  };

  return {
    startState: () => {
      groupLevel = 0;
    },
    token: tokenBase,
  };
};
