import {
  IVec2,
  vec2AB,
  mag2,
  norm2,
  dot2
} from '@scripts/Vec2'
import { FORMATED_VERSION } from '@scripts/env'

import { Plot2 } from '@scripts/Plot2'

const MAX_ENTITIES      = 512
const MAX_FRAME_SAMPLES = 4
const MAX_SPEED         = 10
const DEFAULT_DRAG      = 0.1
const MAX_DATA_LENGTH   = 512

interface IMouse {
  x: number
  y: number
  isLeftDown: boolean
  isRightDown: boolean
  isLeftUp: boolean
  isRightUp: boolean
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
    this.resize()
    await this.init()
    this.loop(-16)
  }
  async stop() {
    cancelAnimationFrame(this.animationID)
  }

  destroy() {
    this.deleteAllEntities()

    this.plots = []
    this.canvas.remove()
  }

  async init() {
    for (let i = 0; i < MAX_ENTITIES; i++) {
      this.entitiesCount++
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
      const r = Math.floor(randomRange(5, 16))
      this.radiuses.push(r)
      this.masses.push(r * r * Math.PI)
      this.colors.push(`#ffffff`)
    }

    this.plots.push(new Plot2(
      { x: 0, y: this.height - 300 * devicePixelRatio },
      { x: 600 * devicePixelRatio, y: 300 * devicePixelRatio }
    ))
  }

  update(dt: number) {
    this.collidingPairs = []
    if (this.mouse.isLeftDown && !this.prevMouse.isLeftDown) {
      if (this.isAdd)
        this.addEntity(this.mouse.x, this.mouse.y)
      else
        for (let i = 0; i < this.entitiesCount; i++) {
          const { x, y } = this.positions[i]
          if (isPointCircleOverlap(this.mouse.x, this.mouse.y, x, y, this.radiuses[i])) {
            this.selected = i
            break
          } else {
            this.selected = -1
          }
        }

      if (this.isDelete) {
        this.deleteEntity(this.selected)
        this.selected = -1
      }
    }

    // Update positions
    for (let i = 0; i < this.entitiesCount && !this.pauseUpdate; i++) {
      this.accelerations[i].x = this.velocities[i].x * -this.drag
      this.accelerations[i].y = this.velocities[i].y * -this.drag
      this.velocities[i].x += this.accelerations[i].x * dt
      this.velocities[i].y += this.accelerations[i].y * dt
      this.positions[i].x  += this.velocities[i].x * dt
      this.positions[i].y  += this.velocities[i].y * dt
      // this.velocities[i].x *= FRICTION
      // this.velocities[i].y *= FRICTION

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
         this.velocities[i].y * this.velocities[i].y < 0.1) {
        this.velocities[i].x = 0
        this.velocities[i].y = 0
      }
    }

    // Detect collisions and resolve them
    for (let i = 0; i < this.entitiesCount; i++) {
      // Current entity is selected
      const { x, y } = this.positions[i]
      // const { x: vx, y: vy } = this.velocities[i]

      for (let j = 0; j < this.entitiesCount; j++) {
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
      const ma = this.masses[first]
      const mb = this.masses[second]
      // Conservation of momentum in the normal direction
      const m1 = ((ma - mb) * n1 + 2 * mb * n2) / (ma + mb)
      const m2 = (2 * ma * n1 + (mb - ma) * n2) / (ma + mb)

      va.x = orthoAB.x * o1 + nab.x * m1
      va.y = orthoAB.y * o1 + nab.y * m1
      vb.x = orthoAB.x * o2 + nab.x * m2
      vb.y = orthoAB.y * o2 + nab.y * m2
    }

    if (this.selected !== -1 && this.mouse.isLeftDown && !this.isPool) {
      this.positions[this.selected].x = this.mouse.x
      this.positions[this.selected].y = this.mouse.y
    } else if (this.selected !== -1 && this.mouse.isLeftUp && this.isPool) {
      const { x, y } = this.positions[this.selected]
      const vx = x - this.mouse.x
      const vy = y - this.mouse.y
      this.velocities[this.selected].x = vx
      this.velocities[this.selected].y = vy
      this.selected = -1
    }

    // Check and resize canvas
    this.resize()
    // Calculate average frame time
    if (this.frameTimes.length >= MAX_FRAME_SAMPLES) {
      this.mFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / MAX_FRAME_SAMPLES
      this.frameTimes = []
    } else {
      this.frameTimes.push(dt)
    }
    // Store previous mouse state
    this.prevMouse = { ...this.mouse }
  }

  draw(dt: number) {
    this.context.clearRect(0, 0, this.width, this.height)

    // Draw entities
    for (let i = 0; i < this.entitiesCount; i++) {
      const { x, y } = this.positions[i]
      const radius   = this.radiuses[i]

      this.context.beginPath()
      this.context.arc(x, y, radius, 0, 2 * Math.PI)
      if (isPointCircleOverlap(this.mouse.x, this.mouse.y, x, y, radius)) {
        this.context.strokeStyle = '#ff0080'
      } else if (this.selected === i) {
        this.context.strokeStyle = '#00ff00'
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

    // Draw collision lines
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

    // Draw pool line
    if (this.selected !== -1 && this.mouse.isLeftDown && this.isPool) {
      const { x, y } = this.positions[this.selected]
      this.context.beginPath()
      this.context.moveTo(x, y)
      this.context.lineTo(this.mouse.x, this.mouse.y)
      this.context.strokeStyle = '#ff1c42'
      this.context.stroke()
      this.context.closePath()
    }

    // // Draw Plots
    // for (let i = 0; i < this.plots.length; i++) {
    //   this.plots[i].draw(this.context, dt)
    // }

    // Draw INFO

    // Total system momentum in both axis
    const mx = this.masses.reduce((a, b, i) => a + (b * this.velocities[i].x), 0)
    const my = this.masses.reduce((a, b, i) => a + (b * this.velocities[i].y), 0)

    this.context.fillStyle = 'white'
    const FONT_SIZE = 12 * devicePixelRatio
    const XPAD = 10 * devicePixelRatio
    this.context.font = `${FONT_SIZE}px 'Roboto Mono', monospace`
    this.context.fillText(`${this.mFrameTime.toFixed(3)} ms, ${(1 / this.mFrameTime).toFixed(1)} fps`,
      XPAD, (FONT_SIZE * 1 + 10))
    this.context.fillText(`sim: ${this.pauseUpdate ? 'pause' : 'play'} (space)`,
      XPAD, (FONT_SIZE * 2 + 10))
    this.context.fillText(`mode: ${this.isPool ? 'pool' : 'move'} (p)`,
      XPAD, (FONT_SIZE * 3 + 10))
    this.context.fillText(`momentum: ${Math.abs((mx + my)).toFixed(2)} kg∙m/s (z: zero)`,
      XPAD, (FONT_SIZE * 4 + 10))
    this.context.fillText(`drag: ${this.drag.toFixed(2)} (+/-)`,
      XPAD, (FONT_SIZE * 5 + 10))
    this.context.fillText(`entities: ${this.entitiesCount} (0: delete all)`,
      XPAD, (FONT_SIZE * 6 + 10))
    this.context.fillStyle = `lightgray`
    this.context.fillText(`hold e + mouse click to add entity`,
      XPAD, (FONT_SIZE * 7 + 10))
    this.context.fillText(`hold d + mouse click to delete entity`,
      XPAD, (FONT_SIZE * 8 + 10))

    this.context.fillText(FORMATED_VERSION, XPAD, this.height - 10)
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
    if (e.key === 'e') {
      this.isAdd = true
    } else if (e.key === 'd') {
      this.isDelete = true
    }
  }
  onKeyUp(e: KeyboardEvent) {
    if (e.key === 'z') {
      for (let i = 0; i < MAX_ENTITIES; i++) {
        this.velocities[i].x = 0
        this.velocities[i].y = 0
        this.accelerations[i].x = 0
        this.accelerations[i].y = 0
      }
    }
    if (e.key === 'e') {
      this.isAdd = false
    } else if (e.key === 'd') {
      this.isDelete = false
    }
  }
  onKeyPress(e: KeyboardEvent) {
    if (e.key === ' ') {
      this.pauseUpdate = !this.pauseUpdate
    }

    if (e.key === 'p') {
      this.isPool = !this.isPool
      this.selected = -1
    }

    if (e.key === '+') {
      this.drag += 0.01
      if (this.drag >= 1) this.drag = 1
    } else if (e.key === '-') {
      this.drag -= 0.01
      if (this.drag <= 0) this.drag = 0
    }
    if (e.key === '0') {
      this.deleteAllEntities()
    }
  }

  private addEntity(x: number, y: number) {
    if (this.entitiesCount >= MAX_ENTITIES) return
    this.positions.push({ x, y })
    this.velocities.push({ x: 0, y: 0 })
    this.accelerations.push({ x: 0, y: 0 })
    const radius = randomRange(5, 25)
    this.radiuses.push(radius)
    this.masses.push(radius * radius * Math.PI)
    this.colors.push('white')
    this.entitiesCount++
  }

  private deleteEntity(index: number) {
    if (index > -1 && index < this.entitiesCount) {
      this.positions.splice(index, 1)
      this.velocities.splice(index, 1)
      this.accelerations.splice(index, 1)
      this.radiuses.splice(index, 1)
      this.masses.splice(index, 1)
      this.colors.splice(index, 1)
      this.entitiesCount--
    }
  }
  private deleteAllEntities() {
    this.positions = []
    this.velocities = []
    this.accelerations = []
    this.radiuses = []
    this.masses = []
    this.colors = []
    this.entitiesCount = 0
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

  private entitiesCount = 0
  private pauseUpdate = false
  private selected     = -1
  private radiuses: number[] = []
  private colors:   string[] = []
  private positions:      IVec2[] = []
  private velocities:     IVec2[] = []
  private accelerations:  IVec2[] = []
  private masses:        number[] = []
  private collidingPairs: {first: number, second: number}[] = []

  private plots: Plot2[] = []
  private timeData: {x: number[], y: number[]} = { x: [], y: [] }

  private mouse: IMouse = {
    x: 0,
    y: 0,
    isLeftDown: false,
    isRightDown: false,
    isLeftUp: true,
    isRightUp: true,
  }
  private prevMouse: IMouse = { ...this.mouse }
  private isPool   = false
  private isAdd    = false
  private isDelete = false
  private drag     = DEFAULT_DRAG

  private mFrameTime = 0  // mean frame time
  private frameTimes: number[] = []

  private lastTime    = 0
  private currentTime = 0
  private animationID = -1
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private resolution = 1.0
}
