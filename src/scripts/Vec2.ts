export interface IVec2 {
  x: number
  y: number
}

export function vec2AB(a: IVec2, b: IVec2): IVec2 {
  return {
    x: b.x - a.x,
    y: b.y - a.y
  }
}

export function mag2(vector: IVec2) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
}

export function norm2(vector: IVec2): IVec2 {
  const mag = mag2(vector)
  return {
    x: vector.x / mag,
    y: vector.y / mag
  }
}

export function dot2(a: IVec2, b: IVec2): number {
  return a.x * b.x + a.y * b.y
}

export function scale2(v: IVec2, s: number): IVec2 {
  return {
    x: v.x * s,
    y: v.x * s
  }
}
