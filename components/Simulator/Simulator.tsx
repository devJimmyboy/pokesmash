import React, { RefObject, useEffect, useImperativeHandle, useRef } from 'react'
import { WebfontLoaderPlugin } from 'pixi-webfont-loader'

import { Stage, Container, Sprite, useTick, Text, withFilters } from '@inlet/react-pixi'
import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { PixiPlugin } from 'gsap/PixiPlugin'
gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(PIXI)
PIXI.extensions.add(WebfontLoaderPlugin)

import { useQueue } from 'react-use'
import { useHotkeys } from 'react-hotkeys-hook'

type Props = {
  width: number
  height: number
  ready: boolean
  text: string[]
}
export interface SimulatorRef {
  gsap: typeof gsap
  cloakOak: (cloak: boolean) => Promise<void>
}

enum SpriteNames {
  oak = 0,
  textBox = 1,
}

const Filters = withFilters(Container, {})

const spriteNames = ['oak', 'textBox']

const Simulator = React.forwardRef<SimulatorRef, Props>(({ width, height, ready, text }, ref) => {
  const sprites = useRef<Array<RefObject<PIXI.DisplayObject>>>([])
  sprites.current.fill(useRef<PIXI.Container>(null), 0, spriteNames.length)

  const { first, add, last, remove, size } = useQueue<string>(text)
  const [loaded, setLoaded] = React.useState(false)

  useImperativeHandle(ref, () => ({
    gsap,
    async cloakOak(cloak: boolean) {},
  }))

  const onLoadedResources = React.useCallback(
    (resources: any) => {
      if (loaded) return
      setLoaded(true)
    },
    [loaded, setLoaded]
  )
  useEffect(() => {
    if (PIXI.Assets.cache.has('Retro Gaming')) {
      PIXI.Assets.add('Retro Gaming', '/fonts/Retro Gaming.ttf')
      PIXI.Assets.load('Retro Gaming').then(onLoadedResources)
    }
  }, [])
  if (!loaded) return null
  return (
    <Stage width={width} height={height} options={{ backgroundAlpha: 0 }} onClick={(e) => ready && remove()}>
      <Sprite scale={2} ref={sprites.current[SpriteNames.oak] as RefObject<PIXI.Sprite>} anchor={0.5} position={{ x: width / 2, y: height / 2 }} image="/assets/ProfessorOak.png" />
      {/* {size !== 0 && first.length !== 0 && (
        <Container x={width / 2} y={height - 44} anchor={0.5} interactive={true} pointerdown={() => remove()}>
          <Sprite ref={sprites.current[SpriteNames.textBox] as RefObject<PIXI.Sprite>} image="/assets/text-bg.png" width={width - 10} anchor={{ x: 0.5, y: 0.8 }} />
          <Text anchor={{ x: 0.5, y: 0 }} x={0} y={-height / 10 + 10} scale={0.5} text={first} style={{ fontFamily: 'Retro Gaming', fontSize: 50 }} zIndex={5} />
        </Container>
      )} */}
    </Stage>
  )
})
Simulator.displayName = 'Simulator'

export default Simulator
