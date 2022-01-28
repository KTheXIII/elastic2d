const MAX_ENTITIES      = 512
const MAX_FRAME_SAMPLES = 8
const MAX_SPEED         = 200
const FRICTION          = 0.999

interface IMouse {
  x: number
  y: number
  isLeftDown: boolean
  isRightDown: boolean
  isLeftUp: boolean
  isRightUp: boolean
}

interface IVec2 {
  x: number
  y: number
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function isCircleOverlap(x: number, y: number, r: number, x2: number, y2: number, r2: number) {
  const dx = x - x2
  const dy = y - y2
  const d  = dx * dx + dy * dy
  return d < (r + r2) * (r + r2)
}

function isPointCircleOverlap(x: number, y: number, tx: number, ty: number, r: number) {
  const dx = x - tx
  const dy = y - ty
  const d  = dx * dx + dy * dy
  return d < r * r
}

function vec2AB(a: IVec2, b: IVec2): IVec2 {
  return {
    x: b.x - a.x,
    y: b.y - a.y
  }
}
function mag2(vector: IVec2) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
}
function norm2(vector: IVec2): IVec2 {
  const mag = mag2(vector)
  return {
    x: vector.x / mag,
    y: vector.y / mag
  }
}
function dot2(a: IVec2, b: IVec2): number {
  return a.x * b.x + a.y * b.y
}
function scale2(v: IVec2, s: number): IVec2 {
  return {
    x: v.x * s,
    y: v.x * s
  }
}

export class Elastic {
  constructor(parent: HTMLDivElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.width  = '100%'
    this.canvas.style.height = '100%'
    parent.appendChild(this.canvas)

    const context = this.canvas.getContext('2d')
    if (context) this.context = context
    else throw new Error('Error creating 2D context')

    this.resize()
  }

  async start() {
    await this.init()
    this.loop(-16)
  }
  async stop() {
    cancelAnimationFrame(this.animationID)
  }

  destroy() {
    this.canvas.remove()
  }

  async init() {
    for (let i = 0; i < MAX_ENTITIES; i++) {
      this.positions.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height
      })
      this.velocities.push({
        x: randomRange(-1, 1) * MAX_SPEED,
        y: randomRange(-1, 1) * MAX_SPEED
      })
      this.accelerations.push({
        x: 0,
        y: 0
      })
      this.radiuses.push(Math.floor(randomRange(5, 16)))
      this.colors.push(`#ffffff`)
    }
  }

  update(dt: number) {
    this.collidingPairs = []

    // Update positions
    for (let i = 0; i < MAX_ENTITIES && !this.pauseUpdate; i++) {
      this.velocities[i].x *= FRICTION
      this.velocities[i].y *= FRICTION
      this.velocities[i].x += this.accelerations[i].x * dt
      this.velocities[i].y += this.accelerations[i].y * dt
      this.positions[i].x  += this.velocities[i].x * dt
      this.positions[i].y  += this.velocities[i].y * dt

      // Check off screen edges and loop around
      if (this.positions[i].x - this.radiuses[i] < 0) {
        this.positions[i].x = this.width - this.radiuses[i]
      }
      if (this.positions[i].x + this.radiuses[i] > this.width) {
        this.positions[i].x = this.radiuses[i]
      }
      if (this.positions[i].y - this.radiuses[i] < 0) {
        this.positions[i].y = this.height - this.radiuses[i]
      }
      if (this.positions[i].y + this.radiuses[i] > this.height) {
        this.positions[i].y = this.radiuses[i]
      }

      // Clamp velocity to zero when it is too small
      if (this.velocities[i].x * this.velocities[i].x +
         this.velocities[i].y * this.velocities[i].y < 0.01) {
        this.velocities[i].x = 0
        this.velocities[i].y = 0
      }
    }

    // Detect collisions and resolve them
    for (let i = 0; i < MAX_ENTITIES; i++) {
      // Current entity is selected
      const { x, y } = this.positions[i]
      // const { x: vx, y: vy } = this.velocities[i]

      if (this.mouse.isLeftDown && !this.prevMouse.isLeftDown ||
         this.mouse.isRightDown && !this.prevMouse.isRightDown) {
        if (isPointCircleOverlap(this.mouse.x, this.mouse.y, x, y, this.radiuses[i]) && this.selected === -1) {
          this.selected = i
        }
      }

      for (let j = 0; j < MAX_ENTITIES; j++) {
        if (i === j) continue
        // Target entity
        const { x: tx, y: ty }   = this.positions[j]
        // const { x: tvx, y: tvy } = this.velocities[j]

        // Check for collision and resolve it
        if (isCircleOverlap(x, y, this.radiuses[i], tx, ty, this.radiuses[j])) {
          const distance = mag2({ x: tx - x, y: ty - y })
          const overlap  = 0.5 * (distance - this.radiuses[i] - this.radiuses[j])
          this.collidingPairs.push({
            first: i,
            second: j
          })

          // Move both entities away from each other by the overlap amount

          // Current entity
          this.positions[i].x -= overlap * (x - tx) / distance
          this.positions[i].y -= overlap * (y - ty) / distance

          // Target entity
          this.positions[j].x += overlap * (x - tx) / distance
          this.positions[j].y += overlap * (y - ty) / distance
        }
      }
    }

    // Solve dynamic collisions between entities
    for (let i = 0; i < this.collidingPairs.length; i++) {
      const { first, second }  = this.collidingPairs[i]
      const a = this.positions[first]
      const b = this.positions[second]
      const ab  = vec2AB(a, b)  // Vector from a to b
      const nab = norm2(ab)
      const orthoAB: IVec2 = { x: -nab.y, y: nab.x }

      const va = this.velocities[first]
      const vb = this.velocities[second]

      // Orthogonal response of velocity vectors
      const o1 = dot2(va, orthoAB)
      const o2 = dot2(vb, orthoAB)

      // Normal response of velocity vectors
      const n1 = dot2(va, nab)
      const n2 = dot2(vb, nab)

      // Entities mass
      const ma = this.radiuses[first]
      const mb = this.radiuses[second]
      // Conservation of momentum in the normal direction
      const m1 = (n1 * (ma - mb) + 2 * mb * n2) / (ma + mb)
      const m2 = (n2 * (mb - ma) + 2 * ma * n1) / (ma + mb)

      va.x = orthoAB.x * o1 + nab.x * m1
      va.y = orthoAB.y * o1 + nab.y * m1
      vb.x = orthoAB.x * o2 + nab.x * m2
      vb.y = orthoAB.y * o2 + nab.y * m2
    }

    if (this.selected !== -1 && this.mouse.isLeftDown) {
      this.positions[this.selected].x = this.mouse.x
      this.positions[this.selected].y = this.mouse.y
    } else if (this.selected !== -1 && this.mouse.isRightUp) {
      const { x, y } = this.positions[this.selected]
      const vx = x - this.mouse.x
      const vy = y - this.mouse.y
      this.velocities[this.selected].x = vx
      this.velocities[this.selected].y = vy
      this.selected = -1
    }

    this.resize()
    if (this.frameTimes.length >= MAX_FRAME_SAMPLES) {
      let frameSums = 0
      for (let i = 0; i < MAX_FRAME_SAMPLES; i++) {
        frameSums += this.frameTimes[i]
      }
      this.mFrameTime = frameSums / MAX_FRAME_SAMPLES
      this.frameTimes = []
    } else {
      this.frameTimes.push(dt)
    }

    this.prevMouse = { ...this.mouse }
  }

  draw(dt: number) {
    this.context.clearRect(0, 0, this.width, this.height)
    for (let i = 0; i < MAX_ENTITIES; i++) {
      const { x, y } = this.positions[i]
      const radius   = this.radiuses[i]

      this.context.beginPath()
      this.context.arc(x, y, radius, 0, 2 * Math.PI)
      if (isPointCircleOverlap(this.mouse.x, this.mouse.y, x, y, radius)) {
        this.context.strokeStyle = '#ff0080'
      } else {
        this.context.strokeStyle = this.colors[i]
      }
      this.context.stroke()
      this.context.closePath()

      // Draw velocity
      this.context.beginPath()
      this.context.strokeStyle = '#00ff99'
      this.context.moveTo(x, y)
      this.context.lineTo(x + this.velocities[i].x * dt * this.radiuses[i],
        y + this.velocities[i].y * dt * this.radiuses[i])
      this.context.stroke()
      this.context.closePath()
    }

    for (let i = 0; i < this.collidingPairs.length; i++) {
      const { first, second } = this.collidingPairs[i]
      const { x: x1, y: y1 } = this.positions[first]
      const { x: x2, y: y2 } = this.positions[second]

      this.context.beginPath()
      this.context.moveTo(x1, y1)
      this.context.lineTo(x2, y2)
      this.context.strokeStyle = '#ff8c00'
      this.context.stroke()
      this.context.closePath()
    }

    if (this.selected !== -1 && this.mouse.isRightDown) {
      const { x, y } = this.positions[this.selected]
      this.context.beginPath()
      this.context.moveTo(x, y)
      this.context.lineTo(this.mouse.x, this.mouse.y)
      this.context.strokeStyle = '#ff1c42'
      this.context.stroke()
      this.context.closePath()
    }

    this.context.fillStyle = 'white'
    this.context.font = `${12 * devicePixelRatio}px monospace`
    this.context.fillText(`${this.mFrameTime.toFixed(3)} ms, ${(1 / this.mFrameTime).toFixed(1)} fps`,
      10 * devicePixelRatio, (14 + 10) * devicePixelRatio)
    this.context.fillText(`sim: ${this.pauseUpdate ? 'pause' : 'play'}`,
      10 * devicePixelRatio, (14 + 10 + 14) * devicePixelRatio)
  }

  loop(time: number) {
    this.currentTime = time
    const dt = (this.currentTime - this.lastTime) / 1000
    this.update(dt)
    this.draw(dt)
    this.lastTime = this.currentTime
    this.animationID = requestAnimationFrame(this.loop.bind(this))
  }

  get width(): number { return this.canvas.width }
  get height(): number { return this.canvas.height }
  get ratio(): number { return this.canvas.width / this.canvas.height }

  onMouseMove(e: MouseEvent) {
    this.mouse.x = e.clientX
    this.mouse.y = e.clientY
  }
  onMouseDown(e: MouseEvent) {
    this.mouse.x = e.clientX
    this.mouse.y = e.clientY

    if (e.button === 0) {
      this.mouse.isLeftDown = true
      this.mouse.isLeftUp   = false
    }

    if (e.button === 2) {
      this.mouse.isRightDown = true
      this.mouse.isRightUp   = false
    }
  }
  onMouseUp(e: MouseEvent) {
    this.mouse.x = e.clientX
    this.mouse.y = e.clientY

    if (e.button === 0) {
      this.mouse.isLeftDown = false
      this.mouse.isLeftUp   = true
    }

    if (e.button === 2) {
      this.mouse.isRightDown = false
      this.mouse.isRightUp   = true
    }
  }
  onContextMenu(e: MouseEvent) {
    e.preventDefault()
  }
  onKeyDown(e: KeyboardEvent) {
    // TODO: Add key bindings
  }
  onKeyUp(e: KeyboardEvent) {
    // TODO: Add key bindings
  }
  onKeyPress(e: KeyboardEvent) {
    if (e.key === ' ') {
      this.pauseUpdate = !this.pauseUpdate
    }
  }

  private resize(): void {
    const displayWidth = Math.round(
      this.canvas.clientWidth * devicePixelRatio * this.resolution
    )
    const displayHeight = Math.round(
      this.canvas.clientHeight * devicePixelRatio * this.resolution
    )
    if (this.width != displayWidth || this.height != displayHeight) {
      this.canvas.width = displayWidth
      this.canvas.height = displayHeight
    }
  }

  private mouse: IMouse = {
    x: 0,
    y: 0,
    isLeftDown: false,
    isRightDown: false,
    isLeftUp: true,
    isRightUp: true,
  }
  private prevMouse: IMouse = { ...this.mouse }

  private pauseUpdate = false
  private selected     = -1
  private radiuses: number[] = []
  private colors:   string[] = []
  private positions:      IVec2[] = []
  private velocities:     IVec2[] = []
  private accelerations:  IVec2[] = []
  private collidingPairs: {first: number, second: number}[] = []

  private mFrameTime = 0  // mean frame time
  private frameTimes: number[] = []

  private lastTime    = 0
  private currentTime = 0
  private animationID = -1
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private resolution = 1.0
}
