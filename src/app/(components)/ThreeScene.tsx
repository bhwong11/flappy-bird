'use client'
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three'

const ThreeScene= () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0.01);
  const birdDirectionRef = useRef<number>(-1);
  let birdUpPeakIncrease = 0
  let birdUpPeakIncreasePeak = 100

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Three.js scene here
      const scene = new THREE.Scene()
      const pinkThreeColor = new THREE.Color('#FFB6C1')
      scene.background = pinkThreeColor

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer()
      renderer.setSize(window.innerWidth, window.innerHeight)
      containerRef.current?.appendChild(renderer.domElement)
      camera.position.z = 5


      const geometry = new THREE.BoxGeometry(1, 1, 1)
      // const material = new THREE.MeshBasicMaterial( { color: 0xff0000})
      // const texture = new THREE.TextureLoader().load( "textures/water.jpg" );
      const material = new THREE.MeshNormalMaterial({blendColor: 0xff0000, flatShading:true})
      
      const cube = new THREE.Mesh(geometry, material)
      scene.add(cube)
      renderer.render(scene, camera)
      console.log('po',cube.position)
      geometry.computeBoundingBox()
      console.log('geometry',geometry.boundingBox)

      // Add this function inside the useEffect hook
      console.log('cube-posiiton',cube.position.x,cube.position.y)
      let stop = false

      const renderScene = () => {
        if(stop) return
        // cube.rotation.x += rotationRef.current
        // cube.rotation.y += rotationRef.current
        if(birdDirectionRef.current>0){
          cube.position.y += 0.2/(birdUpPeakIncrease+1)
          birdUpPeakIncrease+=1
        }else{
          cube.position.y -= 0.01
        }
        console.log('birdUpPeakIncrease',birdUpPeakIncrease)
        if(birdUpPeakIncrease>=birdUpPeakIncreasePeak){
          birdDirectionRef.current=-1
          birdUpPeakIncrease=0
        }

        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)

        const pos = new THREE.Vector3(cube.position.x+1, cube.position.y+(1*birdDirectionRef.current), cube.position.z);
        if (!frustum.containsPoint(pos)) {
            console.log('Out of view',pos)
            stop = true
        }

        renderer.render(scene, camera)
        requestAnimationFrame(renderScene)
      }

      // Call the renderScene function to start the animation loop
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
  }, [])

  return (
  <div>
    <div ref={containerRef} />
    <button className="btn btn-blue" onClick={()=>{
      // rotationRef.current+=0.01
      birdDirectionRef.current = 1
      birdUpPeakIncrease = 0
    }}>
      test
    </button>
  </div>)
}

export default ThreeScene;