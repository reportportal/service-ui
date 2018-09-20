import Parser from 'html-react-parser';

export const safeMessage = (message) =>
  Parser(message.replace(/\n */g, (str) => str.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')));
