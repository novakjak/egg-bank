export const timeFormat = new Intl.DateTimeFormat("cs", {
  hourCycle: 'h24',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export const formatNumber = num => num.toFixed(3).replace(/\.?0+$/, '')
