import React, {
  useRef,
  useEffect,
} from 'react'
import './app.css'

import { Elastic } from '@scripts/Elastic'

export const App: React.FC = () => {
  const display = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!display.current) return

    const elastic = new Elastic(display.current)
    elastic.start()
    const onMouseMove = (e: MouseEvent) => elastic.onMouseMove(e)
    const onMouseDown = (e: MouseEvent) => elastic.onMouseDown(e)
    const onMouseUp   = (e: MouseEvent) => elastic.onMouseUp(e)
    const onKeyDown   = (e: KeyboardEvent) => elastic.onKeyDown(e)
    const onKeyUp     = (e: KeyboardEvent) => elastic.onKeyUp(e)
    const onKeyPress  = (e: KeyboardEvent) => {
      elastic.onKeyPress(e)
    }
    const onContextMenu = (e: MouseEvent) => elastic.onContextMenu(e)
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('keydown',   onKeyDown)
    window.addEventListener('keyup',     onKeyUp)
    window.addEventListener('keypress',  onKeyPress)

    return () => {
      elastic.stop()
      elastic.destroy()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('keydown',   onKeyDown)
      window.removeEventListener('keyup',     onKeyUp)
      window.removeEventListener('keypress',  onKeyPress)
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  return (
    <div className='app w-full h-full' ref={display}>
    </div>
  )
}
