import * as THREE from 'three'
type GeneratePillarProps = {
  numberOfPillars:number,
  pillarWidth:number,
  pillarHeadStart:number,
  pillarYGap:number,
  pillarXGap:number,
  vHeight:number,
  vWidth:number,
  scene:THREE.Scene
}

export const generatePillars = ({
  numberOfPillars,
  pillarWidth,
  pillarHeadStart,
  pillarYGap,
  pillarXGap,
  vHeight,
  vWidth,
  scene
}:GeneratePillarProps)=>{
  return [...Array(numberOfPillars).keys()].map(idx=>idx+1).map(idx=>{

    //top pillars
    const topPillarheight = parseFloat(((Math.random()*2)+0.5).toFixed(2))
    const topPillarCubeGeometry = new THREE.BoxGeometry(pillarWidth, topPillarheight, 1)
    const topPillarCubeMaterial = new THREE.MeshNormalMaterial({blendColor: 0xff0000, flatShading:true})
    
    const topPillarCube = new THREE.Mesh(topPillarCubeGeometry, topPillarCubeMaterial)

    topPillarCube.position.y = vHeight/2 - (topPillarheight/2)
    topPillarCube.position.x = idx*pillarXGap - (vWidth/2) + pillarHeadStart

    scene.add(topPillarCube)

    //bottom pillars
    const bottomPillarheight = vHeight-(topPillarheight+pillarYGap)
    const bottomPillarCubeGeometry = new THREE.BoxGeometry(pillarWidth, bottomPillarheight, 1)
    const bottomPillarCubeMaterial = new THREE.MeshNormalMaterial({blendColor: 0xff0000, flatShading:true})
    
    const bottomPillarCube = new THREE.Mesh(bottomPillarCubeGeometry, bottomPillarCubeMaterial)

    bottomPillarCube.position.y = -vHeight/2 + (bottomPillarheight/2)
    bottomPillarCube.position.x = idx*pillarXGap - (vWidth/2) + pillarHeadStart

    scene.add(bottomPillarCube)


    return {topPillarCube,bottomPillarCube}
  })
}

export const generateCube = (x:number,y:number, z:number, colorCode: number = 0xff1000) =>{
  const wingGeometry = new THREE.BoxGeometry(x,y,z)
  const wingMaterial = new THREE.MeshNormalMaterial({blendColor: colorCode, flatShading:true})
  return new THREE.Mesh(wingGeometry, wingMaterial)
}

export const generateCone = (radius:number, height:number, colorCode: number = 0xff1000) =>{
  const coneGeometry = new THREE.ConeGeometry( radius, height )
  const coneMaterial = new THREE.MeshNormalMaterial({blendColor: colorCode, flatShading:true})
  return new THREE.Mesh(coneGeometry, coneMaterial )
}

export const generateShpere = (radius:number,  colorCode: number = 0xff1000) =>{
  const sphereGeometry = new THREE.SphereGeometry( radius )
  const sphereMaterial = new THREE.MeshNormalMaterial({blendColor: colorCode, flatShading:true})
  return new THREE.Mesh(sphereGeometry, sphereMaterial )
}