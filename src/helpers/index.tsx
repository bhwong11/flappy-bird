import * as THREE from 'three'

export const visibleHeightAtZDepth = ( depth:number, camera:THREE.PerspectiveCamera ) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if ( depth < cameraOffset ) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180; 

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
};

export const visibleWidthAtZDepth = ( depth:number, camera:THREE.PerspectiveCamera ) => {
  const height = visibleHeightAtZDepth( depth, camera );
  return height * camera.aspect;
}

export const checkTwoShapeIntersect=(object1:THREE.Object3D,object2:THREE.Object3D)=>{

  // Check for intersection using bounding box intersection test
  let bBox1 = new THREE.Box3().setFromObject(object1);
  let bBox2 = new THREE.Box3().setFromObject(object2);

  const intersection = bBox1.intersectsBox(bBox2);
  // const intersection = mesh1.geometry.boundingBox.intersectsBox(mesh2.geometry.boundingBox);
  return intersection?true:false
}