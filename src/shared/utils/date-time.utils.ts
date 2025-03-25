export const timeToMilliseconds = (time: string) => {
  const match = time.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error('Wrong time format');

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const unitToMs: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };

  return num * unitToMs[unit];
};

export const calculateDaysBetween = (start: Date, end: Date): number => {
  const timeDiff = new Date(end).getTime() - new Date(start).getTime();
  return timeDiff / (1000 * 3600 * 24);
};
