import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { Pendulum } from "./pendulum.js"
import { WaveSimulation } from "./wave.js"
import { EffectsSystem } from "./effect.js"
import { ControlsManager } from "./controls.js"

/**
 * Enhanced Pendulum Wave Simulation
 */
class PendulumWaveSimulation {
    constructor() {
        // Core components
        this.scene = null
        this.camera = null
        this.renderer = null
        this.controls = null
        this.clock = new THREE.Clock()

        // Simulation objects
        this.pendulums = []
        this.waveSimulation = null
        this.effects = null
        this.controlsManager = null

        // Interaction state
        this.isPlaying = true
        this.isDragging = false
        this.draggedPendulum = null
        this.mouse = new THREE.Vector2()
        this.raycaster = new THREE.Raycaster()
        
        // Debug counter
        this.clickCount = 0

        this.animationId = null

        this.init()
    }

    /**
     * Initialize the simulation
     */
    async init() {
        try {
            this.createScene()
            this.createCamera()
            this.createRenderer()
            this.createControls()
            this.setupLighting()
            this.createPendulums()
            this.createWave()
            this.createEffects()
            this.setupEventListeners()
            this.setupControls()

            this.hideLoadingScreen()
            this.animate()

            console.log("Enhanced Pendulum Wave Simulation initialized successfully!")
        } catch (error) {
            console.error("Failed to initialize simulation:", error)
            this.showError("Failed to load simulation. Please refresh the page.")
        }
    }

    /**
     * Create the scene with enhanced background
     */
    createScene() {
        this.scene = new THREE.Scene()

        // Create gradient background
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext("2d")

        const gradient = ctx.createLinearGradient(0, 0, 0, 512)
        gradient.addColorStop(0, "#1a1a2e")
        gradient.addColorStop(0.5, "#16213e")
        gradient.addColorStop(1, "#0f3460")

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 512)

        const texture = new THREE.CanvasTexture(canvas)
        this.scene.background = texture
        this.scene.fog = new THREE.Fog(0x1a1a2e, 15, 50)
    }

    /**
     * Create camera with better positioning
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(0, 3, 10)
        this.camera.lookAt(0, 2, 0)
    }

    /**
     * Create renderer with enhanced settings
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.2

        const container = document.getElementById("canvas-container")
        if (container) {
            container.appendChild(this.renderer.domElement)
        }
    }

    /**
     * Create enhanced camera controls
     */
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.screenSpacePanning = false
        this.controls.minDistance = 4
        this.controls.maxDistance = 20
        this.controls.maxPolarAngle = Math.PI / 1.8
        this.controls.autoRotate = false
        this.controls.autoRotateSpeed = 0.5
    }

    /**
     * Setup enhanced lighting system
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
        this.scene.add(ambientLight)

        // Main directional light with better shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
        directionalLight.position.set(8, 12, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 50
        directionalLight.shadow.camera.left = -10
        directionalLight.shadow.camera.right = 10
        directionalLight.shadow.camera.top = 10
        directionalLight.shadow.camera.bottom = -10
        directionalLight.shadow.bias = -0.0001
        this.scene.add(directionalLight)

        // Colored point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x4fc3f7, 0.8, 25)
        pointLight1.position.set(-5, 8, 3)
        this.scene.add(pointLight1)

        const pointLight2 = new THREE.PointLight(0xff6b6b, 0.6, 20)
        pointLight2.position.set(5, 6, -2)
        this.scene.add(pointLight2)

        // Spot light for wave surface
        const spotLight = new THREE.SpotLight(0x00ffff, 0.7, 30, Math.PI / 8)
        spotLight.position.set(-5, 10, 0)
        spotLight.target.position.set(-5, -2, 0)
        spotLight.castShadow = true
        this.scene.add(spotLight)
        this.scene.add(spotLight.target)
    }

    /**
     * Create pendulums with enhanced configurations
     */
    createPendulums() {
        const configs = [
            { x: -2.5, y: 4, z: 0, length: 3, mass: 1, color: 0xff4444 },
            { x: 0, y: 4, z: 0, length: 2.5, mass: 1.5, color: 0x44ff44 },
            { x: 2.5, y: 4, z: 0, length: 2, mass: 2, color: 0x4444ff },
        ]

        configs.forEach((config) => {
            const pendulum = new Pendulum(this.scene, config)
            this.pendulums.push(pendulum)
        })
    }

    /**
     * Create enhanced wave simulation
     */
    createWave() {
        this.waveSimulation = new WaveSimulation(this.scene, {
            width: 12,
            height: 8,
            segments: 40,
            position: { x: -6, y: -2, z: 0 },
            amplitude: 0.5,
            frequency: 1.0,
            speed: 1.0,
        })
    }

    /**
     * Create effects system
     */
    createEffects() {
        this.effects = new EffectsSystem(this.scene)
        this.pendulums.forEach((pendulum) => {
            this.effects.addTrail(pendulum)
        })
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mouse events on renderer's canvas
        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown.bind(this))
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this))
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp.bind(this))

        // Touch events for mobile
        this.renderer.domElement.addEventListener("touchstart", this.onTouchStart.bind(this))
        this.renderer.domElement.addEventListener("touchmove", this.onTouchMove.bind(this))
        this.renderer.domElement.addEventListener("touchend", this.onTouchEnd.bind(this))

        // Window events
        window.addEventListener("resize", this.onWindowResize.bind(this))
        window.addEventListener("keydown", this.onKeyDown.bind(this))

        // Prevent context menu
        this.renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault())

        console.log("✅ Event listeners set up (restored original)")
    }

    /**
     * Setup controls manager
     */
    setupControls() {
        this.controlsManager = new ControlsManager(this.pendulums, this.waveSimulation, this.effects)
    }

    /**
     * Mouse interaction handlers - SIMPLIFIED VERSION
     */
    onMouseDown(event) {
        this.updateMousePosition(event.clientX, event.clientY)
        this.checkPendulumInteraction()
        if (this.isDragging) {
            document.body.style.cursor = 'grabbing'
        }
    }

    onMouseMove(event) {
        if (this.isDragging && this.draggedPendulum) {
            this.updateMousePosition(event.clientX, event.clientY)
            this.updateDraggedPendulum()
        } else {
            this.updateMousePosition(event.clientX, event.clientY)
            this.checkBobHover()
        }
    }

    onMouseUp() {
        if (this.isDragging && this.draggedPendulum) {
            this.effects.createExplosion(this.draggedPendulum.getBob().position, this.draggedPendulum.color)
        }
        this.isDragging = false
        this.draggedPendulum = null
        this.controls.enabled = true
        document.body.style.cursor = 'default'
    }

    /**
     * Simple pendulum finding using screen coordinates
     */
    findClickedPendulum(mouseX, mouseY) {
        // Convert screen coordinates to normalized device coordinates
        const ndcX = (mouseX / this.renderer.domElement.width) * 2 - 1
        const ndcY = -(mouseY / this.renderer.domElement.height) * 2 + 1
        
        console.log("NDC coordinates:", ndcX, ndcY)
        
        // Create a ray from the camera
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera)
        
        // Check intersection with all pendulum bobs
        for (const pendulum of this.pendulums) {
            const bob = pendulum.getBob()
            const bobScreenPos = this.worldToScreen(bob.position)
            
            // Calculate distance in screen space
            const distance = Math.sqrt(
                Math.pow(mouseX - bobScreenPos.x, 2) + 
                Math.pow(mouseY - bobScreenPos.y, 2)
            )
            
            console.log(`Pendulum bob screen pos: ${bobScreenPos.x}, ${bobScreenPos.y}, distance: ${distance}`)
            
            // If click is within 50 pixels of bob center
            if (distance < 50) {
                console.log('🎯 Found pendulum to drag!')
                this.isDragging = true
                this.draggedPendulum = pendulum
                this.controls.enabled = false
                this.effects.createExplosion(bob.position, 0xffffff)
                return
            }
        }
        
        console.log('❌ No pendulum found near click')
    }

    /**
     * Simple hover detection
     */
    checkHoverSimple(mouseX, mouseY) {
        // Reset all bob scales
        this.pendulums.forEach(pendulum => {
            pendulum.bob.scale.setScalar(1)
        })
        
        // Check each pendulum
        for (const pendulum of this.pendulums) {
            const bob = pendulum.getBob()
            const bobScreenPos = this.worldToScreen(bob.position)
            
            // Calculate distance in screen space
            const distance = Math.sqrt(
                Math.pow(mouseX - bobScreenPos.x, 2) + 
                Math.pow(mouseY - bobScreenPos.y, 2)
            )
            
            // If mouse is within 30 pixels of bob center
            if (distance < 30) {
                pendulum.bob.scale.setScalar(1.2)
                document.body.style.cursor = 'grab'
                return
            }
        }
        
        document.body.style.cursor = 'default'
    }

    /**
     * Convert world position to screen coordinates
     */
    worldToScreen(worldPos) {
        const vector = worldPos.clone()
        vector.project(this.camera)
        
        return {
            x: (vector.x * 0.5 + 0.5) * this.renderer.domElement.width,
            y: (vector.y * -0.5 + 0.5) * this.renderer.domElement.height
        }
    }

    /**
     * Simple dragging update
     */
    updateDraggedPendulumSimple(mouseX, mouseY) {
        if (!this.draggedPendulum) return
        
        // Convert screen coordinates to world position
        const ndcX = (mouseX / this.renderer.domElement.width) * 2 - 1
        const ndcY = -(mouseY / this.renderer.domElement.height) * 2 + 1
        
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera)
        
        // Get a point at a fixed distance from camera
        const distance = this.camera.position.distanceTo(
            new THREE.Vector3(this.draggedPendulum.pivotX, this.draggedPendulum.pivotY, this.draggedPendulum.pivotZ)
        )
        
        const worldPosition = new THREE.Vector3()
        worldPosition.copy(raycaster.ray.direction)
        worldPosition.multiplyScalar(distance)
        worldPosition.add(raycaster.ray.origin)
        
        this.draggedPendulum.setAngleFromPosition(worldPosition)
    }

    /**
     * Touch event handlers
     */
    onTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0]
            this.updateMousePosition(touch.clientX, touch.clientY)
            this.checkPendulumInteraction()
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.isDragging && this.draggedPendulum) {
            event.preventDefault()
            const touch = event.touches[0]
            this.updateMousePosition(touch.clientX, touch.clientY)
            this.updateDraggedPendulum()
        }
    }

    onTouchEnd() {
        this.onMouseUp()
    }

    /**
     * Update mouse position for raycasting
     */
    updateMousePosition(clientX, clientY) {
        const rect = this.renderer.domElement.getBoundingClientRect()
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    /**
     * Check for pendulum interaction
     */
    checkPendulumInteraction() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const bobs = this.pendulums.map((p) => p.getBob())
        const intersects = this.raycaster.intersectObjects(bobs)
        if (intersects.length > 0) {
            this.isDragging = true
            this.draggedPendulum = intersects[0].object.userData.pendulum
            this.controls.enabled = false
            this.effects.createExplosion(this.draggedPendulum.getBob().position, 0xffffff)
        }
    }

    /**
     * Update dragged pendulum position
     */
    updateDraggedPendulum() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const distance = this.camera.position.distanceTo(
            new THREE.Vector3(this.draggedPendulum.pivotX, this.draggedPendulum.pivotY, this.draggedPendulum.pivotZ)
        )

        const worldPosition = new THREE.Vector3()
        worldPosition.copy(this.raycaster.ray.direction)
        worldPosition.multiplyScalar(distance)
        worldPosition.add(this.raycaster.ray.origin)

        this.draggedPendulum.setAngleFromPosition(worldPosition)
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    /**
     * Handle keyboard shortcuts
     */
    onKeyDown(event) {
        switch (event.code) {
            case "Space":
                event.preventDefault()
                this.togglePause()
                break
            case "KeyR":
                event.preventDefault()
                this.pendulums.forEach((p, i) => {
                    setTimeout(() => p.reset(), i * 200)
                })
                break
            case "KeyT":
                event.preventDefault()
                this.effects.toggleTrails()
                break
            case "KeyC":
                event.preventDefault()
                this.effects.clearTrails()
                break
            case "KeyA":
                event.preventDefault()
                this.controls.autoRotate = !this.controls.autoRotate
                break
        }
    }

    /**
     * Toggle pause with smooth transition
     */
    togglePause() {
        this.isPlaying = !this.isPlaying
        const button = document.getElementById("pausePlay")
        if (button) {
            button.textContent = this.isPlaying ? "Pause" : "Play"
            button.style.background = this.isPlaying ?
                "linear-gradient(45deg, #ff6b6b, #ee5a52)" :
                "linear-gradient(45deg, #4caf50, #45a049)"
        }
    }

    /**
     * Hide loading screen with animation
     */
    hideLoadingScreen() {
        const loading = document.getElementById("loading")
        if (loading) {
            loading.style.opacity = "0"
            loading.style.transform = "scale(0.9)"
            setTimeout(() => (loading.style.display = "none"), 500)
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const loading = document.getElementById("loading")
        if (loading) {
            loading.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <h3>⚠️ Error</h3>
          <p>${message}</p>
          <button onclick="location.reload()" style="
            background: linear-gradient(45deg, #4fc3f7, #29b6f6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" 
             onmouseout="this.style.transform='scale(1)'">
            🔄 Reload Page
          </button>
        </div>
      `
        }
    }

    /**
     * Main animation loop with enhanced performance
     */
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this))

        if (this.isPlaying) {
            const deltaTime = Math.min(this.clock.getDelta(), 0.02) // Cap delta time

            // Update pendulums
            this.pendulums.forEach((pendulum) => {
                if (!this.isDragging || this.draggedPendulum !== pendulum) {
                    pendulum.update(deltaTime)
                }
            })

            // Update wave simulation
            this.waveSimulation.update(deltaTime)

            // Update effects
            this.effects.update(deltaTime, this.pendulums)
        }

        // Always update controls for smooth camera movement
        this.controls.update()

        // Render scene
        this.renderer.render(this.scene, this.camera)
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        if (this.animationId) cancelAnimationFrame(this.animationId)

        this.pendulums.forEach((p) => p.dispose())
        this.waveSimulation.dispose()
        this.effects.dispose()
        this.renderer.dispose()

        // Remove event listeners
        window.removeEventListener("resize", this.onWindowResize)
        window.removeEventListener("keydown", this.onKeyDown)

        console.log("Simulation disposed successfully")
    }

    checkBobHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const bobs = this.pendulums.map((p) => p.getBob())
        const intersects = this.raycaster.intersectObjects(bobs)
        bobs.forEach(bob => bob.scale.setScalar(1))
        if (intersects.length > 0) {
            intersects[0].object.scale.setScalar(1.2)
            document.body.style.cursor = 'grab'
        } else {
            document.body.style.cursor = 'default'
        }
    }
}

// Initialize simulation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.simulation = new PendulumWaveSimulation()
})

// Handle page unload
window.addEventListener("beforeunload", () => {
    if (window.simulation) {
        window.simulation.dispose()
    }
})