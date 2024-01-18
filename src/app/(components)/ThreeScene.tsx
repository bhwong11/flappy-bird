'use client'
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { visibleHeightAtZDepth, visibleWidthAtZDepth, checkTwoShapeIntersect } from '@/helpers';
import { generatePillars, generateCone, generateShpere, generateCube } from '@/ShapeGenerators';

let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null

const ThreeScene= () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wingRotationRef = useRef<number>(0.01);
  const birdDirectionRef = useRef<number>(-1);
  const birdUpIncreaseRef = useRef<number>(0);
  const birdDownIntervalRef = useRef<number>(0.01);
  const [score,setScore] = useState<number>(0);
  const [renderGame,setRenderGame] = useState<boolean>(true);
  const gameOverRef = useRef<boolean>(true)
  const [isFirstGame,setIsFirstGame] = useState<boolean>(true)

  // move this into a data file
  let numberOfPillars = 20

  //let birdUpPeakIncrease = 0
  const birdUpPeakIncreasePeak = 0.3
  const birdUpPeakIncreaseNumerator = 0.05
  const birdFallInterval = 0.01

  const wingRotationMax = 2
  const wingRotationMin = 1.2
  const wingRotationIntervalSpedUp = 0.08
  const wingRotationInterval = 0.01


  const pillarXGap = 3
  const pillarYGap = 3
  const pillarWidth = 1
  const pillarMovementInterval = 0.01

  const pillarHeadStart = 1
  const cubeHeadStart = 1

  //birdSpecs
  const birdBodySize = 0.5
  const wingLength = 0.3
  const wingThickness = 0.1
  const beakRadius = 0.1
  const beakLength = 0.3
  const birdHeadRadius = 0.2

  // starting positions
  const rightWingRotationPosition= 2
  const leftWingRotationPosition = -2
  const headRotationPosition = -1.5

  useEffect(()=>{
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    renderer = new THREE.WebGLRenderer()
  },[])


  useEffect(() => {
    if (typeof window !== 'undefined') {
      birdUpIncreaseRef.current = 0
      birdDirectionRef.current = -1
      wingRotationRef.current = wingRotationInterval
      birdDownIntervalRef.current = birdFallInterval
      if(!renderGame || !renderer || !camera) return

      // Initialize Three.js scene here
      const scene = new THREE.Scene()
      scene.remove.apply(scene, scene.children)
      const bgThreeColor = new THREE.Color('#ADD8E6')
      scene.background = bgThreeColor

      renderer.setSize(window.innerWidth, window.innerHeight)
      containerRef.current?.appendChild(renderer.domElement)
      camera.position.z = 5

      const vHeight:number = visibleHeightAtZDepth(0.5,camera)
      const vWidth:number = visibleWidthAtZDepth(0.5,camera)

      //add lighting
      const directionalLight = new THREE.DirectionalLight( 0xffffff, 4 )
      directionalLight.position.set(0,0,0.5)
      scene.add( directionalLight )


      //create clouds
      const tuft1 = new THREE.SphereGeometry(1.5,7,8)
      tuft1.translate(-2,0,0)

      const tuft2 = new THREE.SphereGeometry(1.5,7,8)
      tuft2.translate(2,0,0)

      const tuft3 = new THREE.SphereGeometry(2.0,7,8)
      tuft3.translate(0,0,0)

      const geo = BufferGeometryUtils.mergeGeometries([tuft1,tuft2,tuft3])

      const cloud = new THREE.Mesh(
        geo,
        new THREE.MeshLambertMaterial({
          color: 0xFFFFFF, side: 2,flatShading:true
        })
      )

      const cloud2 = new THREE.Mesh(
        geo,
        new THREE.MeshLambertMaterial({
          color: 0xFFFFFF, side: 2,flatShading:true
        })
      )

      cloud.position.z = -10
      cloud.position.x = -1

      cloud2.position.z = -10
      cloud2.position.x = 7
      cloud2.position.y = 2
      scene.add(cloud)
      scene.add(cloud2)
      
      const birdBody: THREE.Object3D | null = generateCube(birdBodySize,birdBodySize,birdBodySize)

      const rightWing: THREE.Object3D = generateCube(birdBodySize, wingThickness, wingLength)
      const leftWing: THREE.Object3D = generateCube(birdBodySize, wingThickness, wingLength)

      const beak: THREE.Object3D = generateCone(beakRadius, beakLength)
      const birdHead: THREE.Object3D = generateShpere(birdHeadRadius)

      rightWing.rotation.x = rightWingRotationPosition
      rightWing.position.set(birdBodySize,birdBodySize,0.0)

      const rightGroupWing = new THREE.Group()
      rightGroupWing.add(rightWing)
      rightGroupWing.position.set(-birdBodySize, 0, 0)

      // starting position of right wing
      rightGroupWing.rotation.x = rightWingRotationPosition

      leftWing.rotation.x = leftWingRotationPosition
      leftWing.position.set(birdBodySize,birdBodySize,0.0)

      const leftGroupWing = new THREE.Group()
      leftGroupWing.add(leftWing)
      leftGroupWing.position.set(-birdBodySize, 0, 0)

      // starting position of left wing
      leftGroupWing.rotation.x = leftWingRotationPosition

      //head position
      birdHead.rotation.z = headRotationPosition
      birdHead.position.x = birdBodySize

      //beak position
      beak.rotation.z = headRotationPosition
      beak.position.x = birdBodySize+beakLength


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
        pillarYGap,
        pillarXGap,
        vHeight,
        vWidth,
        scene
      })

      renderer.render(scene, camera)


      const renderChanges = ()=>{
        if(gameOverRef.current || !birdGroup) return

        //wings flapping
        if(rightGroupWing.rotation.x>=wingRotationMax){
          wingRotationRef.current = wingRotationRef.current * -1
        }else if(rightGroupWing.rotation.x<=wingRotationMin){
          wingRotationRef.current = wingRotationRef.current * -1
        }
        rightGroupWing.rotation.x += wingRotationRef.current
        leftGroupWing.rotation.x -= wingRotationRef.current

        let scoreTemp = 0

        for(let c of pillarCubesArr){
          c.topPillarCube.position.x -=pillarMovementInterval
          c.bottomPillarCube.position.x -=pillarMovementInterval
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

        if(!birdGroup || !camera || !renderer) return
        if(birdDirectionRef.current>0){
          birdGroup.position.y += (birdUpPeakIncreaseNumerator/(birdUpIncreaseRef.current+1))
          birdUpIncreaseRef.current+=birdFallInterval
          wingRotationRef.current=wingRotationRef.current>0?wingRotationIntervalSpedUp:-wingRotationIntervalSpedUp 
        }else{
          birdGroup.position.y -= birdDownIntervalRef.current
          wingRotationRef.current=wingRotationRef.current>0?wingRotationInterval:-wingRotationInterval        
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
            birdDownIntervalRef.current = 0
            setGameOverVars()
        }

        const lastPillar = pillarCubesArr[pillarCubesArr.length-1]?.topPillarCube
        if (lastPillar?.position && lastPillar.position.x+pillarWidth/2<(-vWidth/2)) {
          setGameOverVars()
        }
      }


      const renderScene = () => {
        if(!camera || !renderer) return
        renderChanges()
        renderer.render(scene, camera)
        requestAnimationFrame(renderScene)
      }

      birdUpIncreaseRef.current = 0
      renderScene()

      const handleResize = () => {
        if(typeof window=== 'undefined'){
          return
        }
        if(!camera || !renderer) return
        const width = window.innerWidth
        const height = window.innerHeight
  
        camera.aspect = width / height
        camera.updateProjectionMatrix()
  
        renderer.setSize(width, height)
      }
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      }
    }
  }, [renderGame])

  return (
  <div>
    <div ref={containerRef} onClick={()=>{
      birdDirectionRef.current = 1
      birdUpIncreaseRef.current = 0
      birdDownIntervalRef.current = birdFallInterval
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
          {isFirstGame?"start game":"play again"}
        </button>
      </div>
    </div>}
  </div>)
}

export default ThreeScene;