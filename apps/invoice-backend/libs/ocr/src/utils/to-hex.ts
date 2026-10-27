// [r, g, b] (0-255) as "#rrggbb"
export const toHex = ([red, green, blue]: number[]): string =>
  `#${[red, green, blue].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
