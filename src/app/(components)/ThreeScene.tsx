'use client'
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three'
import { visibleHeightAtZDepth, visibleWidthAtZDepth, checkTwoShapeIntersect } from '@/helpers';
import { generatePillars } from '@/ShapeGenerators';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

const ThreeScene= () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0.01);
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

      console.log('VISIBILE',vHeight)


      const cubeGeometry = new THREE.BoxGeometry(0.5,0.5,0.5)
      const cubeMaterial = new THREE.MeshNormalMaterial({blendColor: 0xff1000, flatShading:true})
      
      let cube: THREE.Object3D | null = new THREE.Mesh(cubeGeometry, cubeMaterial)

      scene.add(cube)

      const setGameOverVars = ()=>{
        pillarCubesArr = []
        cube = null
        setIsFirstGame(false)
        gameOverRef.current = true
        setRenderGame(false)
      }
      if(!cube) return

      cube.position.x = -vWidth/2 + cubeHeadStart
      cube.position.y = 0
      cube.updateMatrix()
      let pillarCubesArr = generatePillars({
        numberOfPillars,
        pillarWidth,
        pillarHeadStart,
        pillarGap,
        vHeight,
        scene
      })
      console.log('pillarCubesArr',pillarCubesArr.map(p=>p.bottomPillarCube.position))

      renderer.render(scene, camera)
      // cube.geometry.computeBoundingBox()
      // console.log('geometry',cube.geometry.boundingBox)

      // Add this function inside the useEffect hook


      const renderChanges = ()=>{
        if(gameOverRef.current || !cube) return

        cube.rotation.x += rotationRef.current
        cube.rotation.y += rotationRef.current

        let scoreTemp = 0

        for(let c of pillarCubesArr){
          c.topPillarCube.position.x -=0.01
          c.bottomPillarCube.position.x -=0.01
          if(cube && checkTwoShapeIntersect(c.topPillarCube,cube)){
            console.log('INTERSECT!! TOP')
          }
          if(cube && checkTwoShapeIntersect(c.bottomPillarCube,cube)){
            console.log('INTERSECT!! bOTTOM',cube.position)
          }
          if(cube && (checkTwoShapeIntersect(c.topPillarCube,cube) || checkTwoShapeIntersect(c.bottomPillarCube,cube))){
            // cube.position.x = -vWidth/2 + cubeHeadStart
            // cube.position.y = 0
            // pillarCubesArr = generatePillars({
            //   numberOfPillars,
            //   pillarWidth,
            //   pillarHeadStart,
            //   pillarGap,
            //   vHeight,
            //   scene
            // })
            // scene.remove( cube )
            // scene.remove(c.topPillarCube)
            setGameOverVars()
          }

          if(cube?.position && cube.position.x>c.topPillarCube.position.x){
            scoreTemp++
          }
        }
        if(scoreTemp!==score){
          setScore(scoreTemp)
        }
        if(!cube) return
        if(birdDirectionRef.current>0){
          console.log('birdUpPeakIncrease',birdUpIncreaseRef.current)
          cube.position.y += (birdUpPeakIncreaseNumerator/(birdUpIncreaseRef.current+1))
          birdUpIncreaseRef.current+=0.01
        }else{
          cube.position.y -= decreaseAmount
        }
  
        if(birdUpIncreaseRef.current>=birdUpPeakIncreasePeak){
          birdDirectionRef.current=-1
          birdUpIncreaseRef.current=0
        }

        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)

        const pos = new THREE.Vector3(cube.position.x+1, cube.position.y+(1*birdDirectionRef.current), cube.position.z);
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
      // rotationRef.current+=0.01
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