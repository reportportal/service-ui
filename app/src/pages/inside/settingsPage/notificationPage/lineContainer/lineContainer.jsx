import { PresetLine, InputLine, ButtonLine } from './lines';

const lineTypes = {
  buttonLine: (props) => <ButtonLine {...props} />,
  presetLine: (props) => <PresetLine {...props} />,
  inputLine: (props) => <InputLine {...props} />,
};

const getLine = (lineType, props) => lineTypes[lineType](props);

export const LineContainer = ({ lineType, isLabelRequired, label, inputData, notification }) =>
  getLine(lineType, { isLabelRequired, label, inputData, notification });
