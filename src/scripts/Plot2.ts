import { IVec2 } from '@scripts/Vec2'

export class Plot2 {
  constructor(position: IVec2, size: IVec2) {
    this.position = position
    this.width    = size.x
    this.height   = size.y
  }

  plot(x: number[], y: number[]) {
    if (x.length !== y.length) {
      throw new Error('x and y must have the same length')
    }
    this.x = x
    this.y = y
  }

  draw(context: CanvasRenderingContext2D, dt: number) {
    context.fillStyle = `rgba(0, 0, 0, ${1})`
    context.fillRect(this.position.x, this.position.y, this.width, this.height)
    context.fillStyle = 'white'
    context.font = `${this.fontSize}px 'Roboto Mono', monospace`
    const titleText = `title`
    const titleWidth = context.measureText(titleText).width
    context.fillText(titleText,
      this.position.x + (this.width - titleWidth) / 2,
      this.position.y + this.fontSize + 5 * devicePixelRatio)

    context.beginPath()
    context.fillStyle = 'white'
    context.arc(this.position.x + 10 * devicePixelRatio,
      this.position.y + this.height / 2,
      2 * devicePixelRatio, 0, 2 * Math.PI)
    context.fill()
    context.closePath()
  }

  private fontSize = 12 * devicePixelRatio
  private min = 0
  private max = 1
  private x: number[] = []
  private y: number[] = []
  private position: IVec2 = { x: 0, y: 0 }
  private width: number
  private height: number
  private label: { x: string, y: string } = { x: '', y: '' }
  private title = ''
}
