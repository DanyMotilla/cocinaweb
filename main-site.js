import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/* ========================================
   EASY MODEL ADJUSTMENTS - EDIT THESE!
   ======================================== */
const MODEL_CONFIG = {
  scale: 1.6,           // Overall size of model
  positionX: -0.2,         // Left (-) / Right (+)
  positionY: 0.7,         // Down (-) / Up (+)
  positionZ: 0,         // Back (-) / Forward (+)
  rotationX: 0,      // Tilt forward/back (radians)
  rotationY: 0,         // Turn left/right (radians) 
  rotationZ: 0,         // Roll left/right (radians)
  autoCenter: true,     // Automatically center model in view
  autoScale: false      // Automatically scale to fit view
}

const CAMERA_CONFIG = {
  x: -0.3,
  y: 0.6,
  z: 5
}
/* ======================================== */

const container = document.getElementById('scene')
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  100
)
camera.position.set(CAMERA_CONFIG.x, CAMERA_CONFIG.y, CAMERA_CONFIG.z)

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
container.appendChild(renderer.domElement)

/* LIGHT – adjusted for red background */
scene.add(new THREE.AmbientLight(0xffffff, 1.4))

const key = new THREE.DirectionalLight(0xffffff, 1.2)
key.position.set(2, 3, 4)
scene.add(key)

const fill = new THREE.DirectionalLight(0xffdddd, 0.4)
fill.position.set(-2, 1, -2)
scene.add(fill)

let model = null

const loader = new GLTFLoader()
loader.load(
  '/detailed_burger_meshy.glb',
  gltf => {
    model = gltf.scene
    
    // Auto-center the model if enabled
    if (MODEL_CONFIG.autoCenter) {
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
    }
    
    // Auto-scale to fit view if enabled
    if (MODEL_CONFIG.autoScale) {
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim
      model.scale.setScalar(scale)
    } else {
      model.scale.setScalar(MODEL_CONFIG.scale)
    }
    
    // Apply manual positioning
    model.position.x += MODEL_CONFIG.positionX
    model.position.y += MODEL_CONFIG.positionY
    model.position.z += MODEL_CONFIG.positionZ
    
    // Apply rotation
    model.rotation.set(
      MODEL_CONFIG.rotationX,
      MODEL_CONFIG.rotationY,
      MODEL_CONFIG.rotationZ
    )
    
    scene.add(model)
    
    // Log model info for debugging
    console.log('Model loaded:', {
      position: model.position,
      rotation: model.rotation,
      scale: model.scale
    })
  },
  undefined,
  err => console.error(err)
)

/* SOFT, LIMITED INTERACTION */
let dragging = false
let startX = 0
let target = MODEL_CONFIG.rotationY

container.addEventListener('pointerdown', e => {
  dragging = true
  startX = e.clientX
})

window.addEventListener('pointerup', () => dragging = false)

window.addEventListener('pointermove', e => {
  if (!dragging || !model) return
  const delta = (e.clientX - startX) * 0.002
  target = THREE.MathUtils.clamp(MODEL_CONFIG.rotationY + delta, -0.8, 0.2)
})

const clock = new THREE.Clock()

function animate() {
  const t = clock.getElapsedTime()

  if (model) {
    model.rotation.y += (target - model.rotation.y) * 0.05
    model.rotation.x = MODEL_CONFIG.rotationX + Math.sin(t * 0.6) * 0.05
    model.position.y = MODEL_CONFIG.positionY + Math.sin(t) * 0.06
  }

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
})
