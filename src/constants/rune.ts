export enum Rune {
  El = 1,
  Eld,
  Tir,
  Nef,
  Eth,
  Ith,
  Tal,
  Ral,
  Ort,
  Thul,
  Amn,
  Sol,
  Shael,
  Dol,
  Hel,
  Io,
  Lum,
  Ko,
  Fal,
  Lem,
  Pul,
  Um,
  Mal,
  Ist,
  Gul,
  Vex,
  Ohm,
  Lo,
  Sur,
  Ber,
  Jah,
  Cham,
  Zod,
}

export const Runes = Object.keys(Rune)
  .map(r => Number(r))
  .filter(r => Number.isSafeInteger(r))
  .sort((a, b) => a - b)

export type RuneItem = {
  name: string
  level: number
  runes: Rune[]
}
