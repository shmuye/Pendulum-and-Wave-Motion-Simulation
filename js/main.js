import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js"
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js"
import { Pendulum } from "./pendulum.js"
import { WaveSimulation } from "./wave.js"
import { ControlsManager } from "./controls.js"

/**
 * Main application class - orchestrates the entire simulation
 */
class PendulumWaveSimulation {
    constructor() {
        // Core Three.js components
        this.scene = null
        this.camera = null
        this.renderer = null
        this.controls = null
        this.clock = new THREE.Clock()

        // Simulation components
        this.pendulums = []
        this.waveSimulation = null
        this.controlsManager = null

        // Interaction state
        this.isPlaying = true
        this.isDragging = false
        this.draggedPendulum = null
        this.mouse = new THREE.Vector2()
        this.raycaster = new THREE.Raycaster()

        // Animation
        this.animationId = null

        this.init()
    }

    /**
     * Initialize the entire simulation
     */
    async init() {
        try {
            await this.createScene()
            this.createCamera()
            this.createRenderer()
            this.createControls()
            this.setupLighting()
            this.createPendulums()
            this.createWaveSimulation()
            this.setupEventListeners()
            this.setupGUIControls()

            // Hide loading screen
            this.hideLoadingScreen()

            // Start animation loop
            this.animate()

            console.log("Pendulum Wave Simulation initialized successfully")
        } catch (error) {
            console.error("Failed to initialize simulation:", error)
            this.showError("Failed to load simulation. Please refresh the page.")
        }
    }

    /**
     * Create the Three.js scene
     */
    async createScene() {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x87ceeb)
        this.scene.fog = new THREE.Fog(0x87ceeb, 10, 50)
    }

    /**
     * Create and configure the camera
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(0, 2, 8)
    }

    /**
     * Create and configure the renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.outputColorSpace = THREE.SRGBColorSpace

        const container = document.getElementById("canvas-container")
        if (container) {
            container.appendChild(this.renderer.domElement)
        }
    }

    /**
     * Create orbit controls for camera navigation
     */
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.screenSpacePanning = false
        this.controls.minDistance = 3
        this.controls.maxDistance = 20
        this.controls.maxPolarAngle = Math.PI / 2
    }

    /**
     * Setup scene lighting
     */
    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
        this.scene.add(ambientLight)

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 10, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 50
        directionalLight.shadow.camera.left = -10
        directionalLight.shadow.camera.right = 10
        directionalLight.shadow.camera.top = 10
        directionalLight.shadow.camera.bottom = -10
        this.scene.add(directionalLight)

        // Point light for pendulum area
        const pointLight = new THREE.PointLight(0xffffff, 0.6, 20)
        pointLight.position.set(0, 6, 2)
        pointLight.castShadow = true
        this.scene.add(pointLight)

        // Spot light for wave surface
        const spotLight = new THREE.SpotLight(0x00ffff, 0.5, 30, Math.PI / 6)
        spotLight.position.set(-5, 8, 0)
        spotLight.target.position.set(-5, -2, 0)
        spotLight.castShadow = true
        this.scene.add(spotLight)
        this.scene.add(spotLight.target)
    }

    /**
     * Create pendulum objects
     */
    createPendulums() {
        const pendulumConfigs = [
            { x: -2, y: 4, z: 0, length: 3, mass: 1, color: 0xff4444 },
            { x: 0, y: 4, z: 0, length: 2.5, mass: 1.5, color: 0x44ff44 },
            { x: 2, y: 4, z: 0, length: 2, mass: 2, color: 0x4444ff },
        ]

        pendulumConfigs.forEach((config) => {
            const pendulum = new Pendulum(this.scene, config)
            this.pendulums.push(pendulum)
        })
    }

    /**
     * Create wave simulation
     */
    createWaveSimulation() {
        this.waveSimulation = new WaveSimulation(this.scene, {
            width: 10,
            height: 6,
            segments: 64,
            position: { x: -5, y: -2, z: 0 },
            amplitude: 0.5,
            frequency: 1.0,
            speed: 1.0,
        })
    }

    /**
     * Setup event listeners for user interaction
     */
    setupEventListeners() {
        // Mouse events for pendulum interaction
        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown.bind(this))
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this))
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp.bind(this))

        // Touch events for mobile support
        this.renderer.domElement.addEventListener("touchstart", this.onTouchStart.bind(this))
        this.renderer.domElement.addEventListener("touchmove", this.onTouchMove.bind(this))
        this.renderer.domElement.addEventListener("touchend", this.onTouchEnd.bind(this))

        // Window resize
        window.addEventListener("resize", this.onWindowResize.bind(this))

        // Keyboard shortcuts
        window.addEventListener("keydown", this.onKeyDown.bind(this))

        // Prevent context menu on canvas
        this.renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault())
    }

    /**
     * Setup GUI controls
     */
    setupGUIControls() {
        const simulationControls = {
            isPlaying: this.isPlaying,
            togglePause: () => {
                this.isPlaying = !this.isPlaying
            },
        }

        this.controlsManager = new ControlsManager(this.pendulums, this.waveSimulation, simulationControls)
    }

    /**
     * Handle mouse down events
     */
    onMouseDown(event) {
        this.updateMousePosition(event.clientX, event.clientY)
        this.checkPendulumInteraction()
    }

    /**
     * Handle mouse move events
     */
    onMouseMove(event) {
        if (this.isDragging && this.draggedPendulum) {
            this.updateMousePosition(event.clientX, event.clientY)
            this.updateDraggedPendulum()
        }
    }

    /**
     * Handle mouse up events
     */
    onMouseUp() {
        this.isDragging = false
        this.draggedPendulum = null
        this.controls.enabled = true
    }

    /**
     * Handle touch start events
     */
    onTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0]
            this.updateMousePosition(touch.clientX, touch.clientY)
            this.checkPendulumInteraction()
        }
    }

    /**
     * Handle touch move events
     */
    onTouchMove(event) {
        if (event.touches.length === 1 && this.isDragging && this.draggedPendulum) {
            event.preventDefault()
            const touch = event.touches[0]
            this.updateMousePosition(touch.clientX, touch.clientY)
            this.updateDraggedPendulum()
        }
    }

    /**
     * Handle touch end events
     */
    onTouchEnd() {
        this.onMouseUp()
    }

    /**
     * Update mouse position for raycasting
     */
    updateMousePosition(clientX, clientY) {
        this.mouse.x = (clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1
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
        }
    }

    /**
     * Update dragged pendulum position
     */
    updateDraggedPendulum() {
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // Project mouse position to world coordinates
        const distance = this.camera.position.distanceTo(
            new THREE.Vector3(this.draggedPendulum.pivotX, this.draggedPendulum.pivotY, this.draggedPendulum.pivotZ),
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
                this.isPlaying = !this.isPlaying
                const pauseButton = document.getElementById("pausePlay")
                if (pauseButton) {
                    pauseButton.textContent = this.isPlaying ? "Pause" : "Play"
                }
                break
            case "KeyR":
                event.preventDefault()
                this.pendulums.forEach((pendulum) => pendulum.reset())
                break
            case "KeyF":
                event.preventDefault()
                this.toggleFullscreen()
                break
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loading = document.getElementById("loading")
        if (loading) {
            loading.style.opacity = "0"
            setTimeout(() => {
                loading.style.display = "none"
            }, 500)
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
          <h3>Error</h3>
          <p>${message}</p>
          <button onclick="location.reload()" style="
            background: #4fc3f7;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
          ">Reload Page</button>
        </div>
      `
        }
    }

    /**
     * Main animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this))

        if (this.isPlaying) {
            const deltaTime = this.clock.getDelta()

            // Update pendulums (only if not being dragged)
            this.pendulums.forEach((pendulum) => {
                if (!this.isDragging || this.draggedPendulum !== pendulum) {
                    pendulum.update(deltaTime)
                }
            })

            // Update wave simulation
            this.waveSimulation.update(deltaTime)
        }

        // Update controls
        this.controls.update()

        // Render scene
        this.renderer.render(this.scene, this.camera)
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId)
        }

        // Dispose pendulums
        this.pendulums.forEach((pendulum) => pendulum.dispose())

        // Dispose wave simulation
        if (this.waveSimulation) {
            this.waveSimulation.dispose()
        }

        // Dispose renderer
        this.renderer.dispose()

        // Remove event listeners
        window.removeEventListener("resize", this.onWindowResize)
        window.removeEventListener("keydown", this.onKeyDown)

        console.log("Simulation disposed")
    }
}

// Initialize the simulation when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.simulation = new PendulumWaveSimulation()
})

// Handle page unload
window.addEventListener("beforeunload", () => {
    if (window.simulation) {
        window.simulation.dispose()
    }
})
