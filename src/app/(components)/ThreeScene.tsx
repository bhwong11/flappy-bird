'use client'
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three'
import { visibleHeightAtZDepth, visibleWidthAtZDepth, checkTwoShapeIntersect } from '@/helpers';
import { generatePillars, generateCone, generateShpere, generateCube } from '@/ShapeGenerators';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

const ThreeScene= () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wingRotationRef = useRef<number>(0.01);
  const birdDirectionRef = useRef<number>(-1);
  const birdUpIncreaseRef = useRef<number>(0);
  const [score,setScore] = useState<number>(0);
  const [renderGame,setRenderGame] = useState<boolean>(true);
  const gameOverRef = useRef<boolean>(true)
  const [isFirstGame,setIsFirstGame] = useState<boolean>(true)

  let numberOfPillars = 5

  //let birdUpPeakIncrease = 0
  const birdUpPeakIncreasePeak = 0.3
  const birdUpPeakIncreaseNumerator = 0.05
  let decreaseAmount = 0.01
  const pillarGap = 3
  const pillarWidth = 1

  let pillarHeadStart = 2
  let cubeHeadStart = 1



  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('render Game',renderGame)
      birdUpIncreaseRef.current = 0
      birdDirectionRef.current = -1
      wingRotationRef.current = 0.01
      if(!renderGame) return

      // Initialize Three.js scene here
      const scene = new THREE.Scene()
      scene.remove.apply(scene, scene.children)
      const pinkThreeColor = new THREE.Color('#FFB6C1')
      scene.background = pinkThreeColor

      renderer.setSize(window.innerWidth, window.innerHeight)
      containerRef.current?.appendChild(renderer.domElement)
      camera.position.z = 5

      const vHeight = visibleHeightAtZDepth(0.5,camera)
      const vWidth = visibleWidthAtZDepth(0.5,camera)
      
      let birdBody: THREE.Object3D | null = generateCube(0.5,0.5,0.5,0xff1000)

      const rightWing: THREE.Object3D = generateCube(0.5,0.1,0.5,0xff1000)
      const leftWing: THREE.Object3D = generateCube(0.5,0.1,0.5,0xff1000)

      const beak: THREE.Object3D = generateCone(0.1, 0.3, 0xff1000)

      const birdHead: THREE.Object3D = generateShpere(0.2, 0xff1000)

      rightWing.rotation.x = 2
      rightWing.position.set(0.5,0.5,0.0)

      const rightGroupWing = new THREE.Group()
      rightGroupWing.add(rightWing)
      rightGroupWing.position.set(-0.5, -0.0, 0)

      // starting position of right wing
      rightGroupWing.rotation.x = 2

      leftWing.rotation.x = -2
      leftWing.position.set(0.5,0.5,0.0)

      const leftGroupWing = new THREE.Group()
      leftGroupWing.add(leftWing)
      leftGroupWing.position.set(-0.5, -0.0, 0)

      // starting position of left wing
      leftGroupWing.rotation.x = 4

      //beak position
      beak.rotation.z = -1.5
      beak.position.x = 0.7

      //head position
      birdHead.rotation.z = -1.5
      birdHead.position.x = 0.4


      let birdGroup: THREE.Object3D | null = new THREE.Group();
      birdGroup.add(beak)
      birdGroup.add(birdHead)
      birdGroup.add(birdBody)
      birdGroup.add(rightGroupWing)
      birdGroup.add(leftGroupWing)
      scene.add(birdGroup)

      const setGameOverVars = ()=>{
        pillarCubesArr = []
        birdGroup = null
        setIsFirstGame(false)
        gameOverRef.current = true
        setRenderGame(false)
      }
      if(!birdGroup) return

      birdGroup.position.x = -vWidth/2 + cubeHeadStart
      birdGroup.position.y = 0

      let pillarCubesArr = generatePillars({
        numberOfPillars,
        pillarWidth,
        pillarHeadStart,
        pillarGap,
        vHeight,
        scene
      })
      //pillarCubesArr = []
      console.log('pillarCubesArr',pillarCubesArr.map(p=>p.bottomPillarCube.position))

      renderer.render(scene, camera)


      const renderChanges = ()=>{
        if(gameOverRef.current || !birdGroup) return

        //wings flapping
        if(rightGroupWing.rotation.x>=2){
          console.log('HIT!!')
          wingRotationRef.current = wingRotationRef.current * -1
        }else if(rightGroupWing.rotation.x<=1.2){
          console.log('INCREWAING')
          wingRotationRef.current = wingRotationRef.current * -1
        }
        console.log('CCU',rightGroupWing.rotation.x)
        rightGroupWing.rotation.x += wingRotationRef.current
        leftGroupWing.rotation.x -= wingRotationRef.current

        let scoreTemp = 0

        for(let c of pillarCubesArr){
          c.topPillarCube.position.x -=0.01
          c.bottomPillarCube.position.x -=0.01
          if(birdGroup && checkTwoShapeIntersect(c.topPillarCube,birdGroup)){
            console.log('INTERSECT!! TOP')
          }
          if(birdGroup && checkTwoShapeIntersect(c.bottomPillarCube,birdGroup)){
            console.log('INTERSECT!! bOTTOM',birdGroup.position)
          }
          if(birdGroup && (checkTwoShapeIntersect(c.topPillarCube,birdGroup) || checkTwoShapeIntersect(c.bottomPillarCube,birdGroup))){
            setGameOverVars()
          }

          if(birdGroup?.position && birdGroup.position.x>c.topPillarCube.position.x){
            scoreTemp++
          }
        }
        if(scoreTemp!==score){
          setScore(scoreTemp)
        }
        if(!birdGroup) return
        if(birdDirectionRef.current>0){
          console.log('birdUpPeakIncrease',birdUpIncreaseRef.current)
          birdGroup.position.y += (birdUpPeakIncreaseNumerator/(birdUpIncreaseRef.current+1))
          birdUpIncreaseRef.current+=0.01
          wingRotationRef.current=wingRotationRef.current>0?0.08:-0.08
        }else{
          birdGroup.position.y -= decreaseAmount
          wingRotationRef.current=wingRotationRef.current>0?0.01:-0.01
        }
  
        if(birdUpIncreaseRef.current>=birdUpPeakIncreasePeak){
          birdDirectionRef.current=-1
          birdUpIncreaseRef.current=0
        }

        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)

        const pos = new THREE.Vector3(birdGroup.position.x+1, birdGroup.position.y+(1*birdDirectionRef.current), birdGroup.position.z);
        if (!frustum.containsPoint(pos)) {
            decreaseAmount = 0
            setGameOverVars()
        }

        const lastPillar = pillarCubesArr[pillarCubesArr.length-1]?.topPillarCube
        if (lastPillar?.position && lastPillar.position.x+pillarWidth/2<(-vWidth/2)) {
          console.log('last out of range!!')
          setGameOverVars()
        }
      }


      const renderScene = () => {
        renderChanges()
        renderer.render(scene, camera)
        requestAnimationFrame(renderScene)
      }

      // Call the renderScene function to start the animation loop
      birdUpIncreaseRef.current = 0
      renderScene()

      const handleResize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
  
        camera.aspect = width / height
        camera.updateProjectionMatrix()
  
        renderer.setSize(width, height)
      }
  
      window.addEventListener('resize', handleResize);
  
      // Clean up the event listener when the component is unmounted
      return () => {
        window.removeEventListener('resize', handleResize);
      }
    }
  }, [renderGame])

  return (
  <div>
    <div ref={containerRef} onClick={()=>{
      // wingRotationRef.current+=0.01
      birdDirectionRef.current = 1
      birdUpIncreaseRef.current = 0
      decreaseAmount = 0.01
    }}/>
    <div className="fixed top-0 z-100 flex w-screen justify-center">
      <div className="text-black text-center text-xl bg-white border-4 border-black rounded min-w-[3rem]">
        {score}
      </div>
    </div>
    { (!renderGame || isFirstGame) &&
    <div className="w-screen h-screen absolute top-0 flex justify-center items-center">
      <div className="p-3 bg-white rounded border-4 border-black">
        <button className="btn btn-blue" onClick={()=> {
          setRenderGame(true)
          gameOverRef.current = !gameOverRef.current
          setIsFirstGame(false)
        }}>
          {!isFirstGame?<div className='text-lg'>scrore: {score}</div>:null}
          {/* {JSON.stringify(renderGame)}
          {JSON.stringify(isFirstGame)} */}
          {isFirstGame?"start game":"play again"}
        </button>
      </div>
    </div>}
  </div>)
}

export default ThreeScene;