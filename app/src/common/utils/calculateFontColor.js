import { COLOR_BLACK_2, COLOR_WHITE_TWO } from 'common/constants/colors';

// calculate contrast of background - foreground colors using algorithm recommended by w3c.org
export const calculateFontColor = (color = COLOR_WHITE_TWO) => {
  const hexcolor = color.slice(1);

  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const bgBrightnessLevel = (r * 299 + g * 587 + b * 114) / 1000;

  return bgBrightnessLevel >= 125 ? COLOR_BLACK_2 : COLOR_WHITE_TWO;
};
