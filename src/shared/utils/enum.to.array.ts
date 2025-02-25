/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export const enumToArray = (enumVariable: any): string[] => {
  return Object.keys(enumVariable).map((key) => enumVariable[key]);
};
