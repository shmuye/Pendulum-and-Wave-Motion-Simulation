import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js"
import { createWaterTexture } from "./utils.js"

/**
 * Wave simulation class - handles wave surface animation and rendering
 */
export class WaveSimulation {
    constructor(scene, config = {}) {
        this.scene = scene

        // Wave parameters
        this.params = {
            amplitude: config.amplitude || 0.5,
            frequency: config.frequency || 1.0,
            speed: config.speed || 1.0,
            time: 0,
        }

        // Wave geometry properties
        this.waveWidth = config.width || 10
        this.waveHeight = config.height || 6
        this.waveSegments = config.segments || 64
        this.position = config.position || { x: -5, y: -2, z: 0 }

        // 3D objects
        this.geometry = null
        this.material = null
        this.mesh = null
        this.originalPositions = null

        this.createWaveSurface()
    }

    /**
     * Create the wave surface geometry and material
     */
    createWaveSurface() {
        // Create wave geometry
        this.geometry = new THREE.PlaneGeometry(this.waveWidth, this.waveHeight, this.waveSegments, this.waveSegments)

        // Create procedural water texture
        const textureCanvas = createWaterTexture()
        const texture = new THREE.CanvasTexture(textureCanvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(4, 4)

        // Create wave material
        this.material = new THREE.MeshPhongMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            shininess: 100,
            specular: 0x111111,
            map: texture,
        })

        // Create wave mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = -Math.PI / 2
        this.mesh.position.set(this.position.x, this.position.y, this.position.z)
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)

        // Store original positions for wave animation
        const positions = this.geometry.attributes.position.array
        this.originalPositions = new Float32Array(positions)
    }

    /**
     * Update wave animation
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        this.params.time += deltaTime * this.params.speed

        const positions = this.geometry.attributes.position.array

        // Animate wave vertices
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalPositions[i]
            const y = this.originalPositions[i + 1]

            // Combine multiple wave functions for realistic water motion
            const wave1 = Math.sin(x * this.params.frequency + this.params.time) * this.params.amplitude
            const wave2 = Math.sin(y * this.params.frequency * 0.7 + this.params.time * 1.3) * this.params.amplitude * 0.5
            const wave3 =
                Math.sin((x + y) * this.params.frequency * 0.5 + this.params.time * 0.8) * this.params.amplitude * 0.3
            const wave4 =
                Math.sin((x - y) * this.params.frequency * 0.3 + this.params.time * 2.1) * this.params.amplitude * 0.2

            positions[i + 2] = wave1 + wave2 + wave3 + wave4
        }

        // Update geometry
        this.geometry.attributes.position.needsUpdate = true
        this.geometry.computeVertexNormals()

        // Update material color based on wave motion
        this.updateWaveColor()
    }

    /**
     * Update wave color based on animation
     */
    updateWaveColor() {
        const hue = 0.6 + Math.sin(this.params.time * 0.5) * 0.1
        const saturation = 0.8 + Math.sin(this.params.time * 0.3) * 0.2
        const lightness = 0.4 + Math.sin(this.params.time * 0.7) * 0.1

        this.material.color.setHSL(hue, saturation, lightness)
    }

    /**
     * Update wave parameters
     * @param {Object} newParams - New wave parameters
     */
    updateParameters(newParams) {
        Object.assign(this.params, newParams)
    }

    /**
     * Get current wave parameters
     * @returns {Object} Current wave parameters
     */
    getParameters() {
        return { ...this.params }
    }

    /**
     * Get wave height at specific position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Wave height at position
     */
    getHeightAt(x, y) {
        const wave1 = Math.sin(x * this.params.frequency + this.params.time) * this.params.amplitude
        const wave2 = Math.sin(y * this.params.frequency * 0.7 + this.params.time * 1.3) * this.params.amplitude * 0.5
        const wave3 = Math.sin((x + y) * this.params.frequency * 0.5 + this.params.time * 0.8) * this.params.amplitude * 0.3
        const wave4 = Math.sin((x - y) * this.params.frequency * 0.3 + this.params.time * 2.1) * this.params.amplitude * 0.2

        return wave1 + wave2 + wave3 + wave4
    }

    /**
     * Dispose of wave resources
     */
    dispose() {
        this.scene.remove(this.mesh)
        this.geometry.dispose()
        this.material.dispose()
        if (this.material.map) this.material.map.dispose()
    }
}
