'use client'
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three'

const ThreeScene= () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0.01);
  const birdDirectionRef = useRef<number>(-1);
  let numberOfPillars = 5

  let birdUpPeakIncrease = 0
  let birdUpPeakIncreasePeak = 0.5
  let birdUpPeakIncreaseNumerator = 0.05
  let decreaseAmount = 0.01

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

      // Get the field of view
      var fov = camera;

      // Log the field of view to the console
      console.log("Field of View:", fov);

      const visibleHeightAtZDepth = ( depth, camera ) => {
        // compensate for cameras not positioned at z=0
        const cameraOffset = camera.position.z;
        if ( depth < cameraOffset ) depth -= cameraOffset;
        else depth += cameraOffset;
      
        // vertical fov in radians
        const vFOV = camera.fov * Math.PI / 180; 
      
        // Math.abs to ensure the result is always positive
        return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
      };
      
      const visibleWidthAtZDepth = ( depth, camera ) => {
        const height = visibleHeightAtZDepth( depth, camera );
        return height * camera.aspect;
      };

      const vHeight = visibleHeightAtZDepth(0.5,camera)

      console.log('VISIBILE',vHeight)


      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
      const cubeMaterial = new THREE.MeshNormalMaterial({blendColor: 0xff0000, flatShading:true})
      
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

      scene.add(cube)

      const pillarCubesArrTop = [...Array(numberOfPillars).keys()].map(idx=>{
        const height = parseFloat(((Math.random()*2)+0.5).toFixed(2))
        const pillarCubeGeometry = new THREE.BoxGeometry(1, height, 1)
        const pillarCubeMaterial = new THREE.MeshNormalMaterial({blendColor: 0xff0000, flatShading:true})
        
        const pillarCube = new THREE.Mesh(pillarCubeGeometry, pillarCubeMaterial)

        pillarCube.position.y = vHeight/2 - (height/2)
        //pillarCube.position.y = 3.43
        pillarCube.position.x = idx%2===0?idx * 1.2:(idx*1.2)*-1
        pillarCube.position.z = 0
        pillarCube.geometry.computeBoundingBox()
        console.log('geometry',pillarCube.geometry.boundingBox)

        console.log('poistuin',pillarCube.position.x)
        //pillarCube.position.x = -0.2
        scene.add(pillarCube)
        return pillarCube
      })

      renderer.render(scene, camera)
      console.log('po',cube.position)
      // cube.geometry.computeBoundingBox()
      // console.log('geometry',cube.geometry.boundingBox)

      // Add this function inside the useEffect hook

      console.log('cube-posiiton',cube.position.x,cube.position.y)
      let stop = false

      const renderScene = () => {
        if(stop) return

        cube.rotation.x += rotationRef.current
        cube.rotation.y += rotationRef.current
        if(birdDirectionRef.current>0){
          console.log('birdUpPeakIncrease',birdUpPeakIncrease)
          cube.position.y += birdUpPeakIncreaseNumerator/(birdUpPeakIncrease+1)
          birdUpPeakIncrease+=0.01
        }else{
          cube.position.y -= decreaseAmount
        }
  
        if(birdUpPeakIncrease>=birdUpPeakIncreasePeak){
          birdDirectionRef.current=-1
          birdUpPeakIncrease=0
        }

        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)

        const pos = new THREE.Vector3(cube.position.x+1, cube.position.y+(1*birdDirectionRef.current), cube.position.z);
        if (!frustum.containsPoint(pos)) {
            // console.log('Out of view',pos)
            decreaseAmount = 0
            //birdDirectionRef.current=(-1*birdDirectionRef.current)
            //stop = true
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
      decreaseAmount = 0.01
    }}>
      test
    </button>
  </div>)
}

export default ThreeScene;