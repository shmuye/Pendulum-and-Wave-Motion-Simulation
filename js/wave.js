import * as THREE from "three"

/**
 * Enhanced Wave Simulation with beautiful animations
 */
export class WaveSimulation {
    constructor(scene, config = {}) {
        this.scene = scene
        this.params = {
            amplitude: config.amplitude || 0.5,
            frequency: config.frequency || 1.0,
            speed: config.speed || 1.0,
            time: 0,
        }

        this.waveWidth = config.width || 10
        this.waveHeight = config.height || 6
        this.waveSegments = config.segments || 40
        this.position = config.position || { x: -5, y: -2, z: 0 }

        this.geometry = null
        this.material = null
        this.mesh = null
        this.originalPositions = null

        // Animation properties
        this.colorTime = 0
        this.wavePhases = []

        this.createWave()
    }

    /**
     * Create enhanced wave surface
     */
    createWave() {
        this.geometry = new THREE.PlaneGeometry(this.waveWidth, this.waveHeight, this.waveSegments, this.waveSegments)

        // Enhanced water material with better visuals
        this.material = new THREE.MeshPhongMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.8,
            shininess: 100,
            specular: 0x222222,
            reflectivity: 0.3,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = -Math.PI / 2
        this.mesh.position.set(this.position.x, this.position.y, this.position.z)
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)

        const positions = this.geometry.attributes.position.array
        this.originalPositions = new Float32Array(positions)

        // Initialize wave phases for more complex animation
        for (let i = 0; i < 4; i++) {
            this.wavePhases.push({
                frequency: 0.5 + Math.random() * 2,
                amplitude: 0.3 + Math.random() * 0.7,
                speed: 0.8 + Math.random() * 1.4,
                offset: Math.random() * Math.PI * 2,
            })
        }
    }

    /**
     * Update wave with enhanced animations
     */
    update(deltaTime) {
        this.params.time += deltaTime * this.params.speed
        this.colorTime += deltaTime

        const positions = this.geometry.attributes.position.array

        // Create complex wave patterns
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalPositions[i]
            const y = this.originalPositions[i + 1]

            let height = 0

            // Combine multiple wave functions for realistic water
            this.wavePhases.forEach((phase, index) => {
                const waveX = Math.sin(
                    x * this.params.frequency * phase.frequency + this.params.time * phase.speed + phase.offset,
                )
                const waveY = Math.sin(
                    y * this.params.frequency * phase.frequency * 0.7 + this.params.time * phase.speed * 1.3 + phase.offset,
                )
                const waveXY = Math.sin(
                    (x + y) * this.params.frequency * phase.frequency * 0.5 + this.params.time * phase.speed * 0.8 + phase.offset,
                )

                height += (waveX + waveY * 0.5 + waveXY * 0.3) * this.params.amplitude * phase.amplitude * 0.25
            })

            positions[i + 2] = height
        }

        this.geometry.attributes.position.needsUpdate = true
        this.geometry.computeVertexNormals()

        // Animate colors with multiple hues
        const hue1 = 0.6 + Math.sin(this.colorTime * 0.5) * 0.1
        const hue2 = 0.55 + Math.cos(this.colorTime * 0.3) * 0.05
        const finalHue = (hue1 + hue2) / 2

        this.material.color.setHSL(finalHue, 0.8, 0.4)

        // Animate opacity for breathing effect
        this.material.opacity = 0.7 + Math.sin(this.colorTime * 2) * 0.1
    }

    /**
     * Update parameters
     */
    updateParameters(newParams) {
        Object.assign(this.params, newParams)
    }

    /**
     * Get parameters
     */
    getParameters() {
        return {...this.params }
    }

    /**
     * Get wave height at position (for interactions)
     */
    getHeightAt(x, y) {
        let height = 0
        this.wavePhases.forEach((phase) => {
            const waveX = Math.sin(
                x * this.params.frequency * phase.frequency + this.params.time * phase.speed + phase.offset,
            )
            const waveY = Math.sin(
                y * this.params.frequency * phase.frequency * 0.7 + this.params.time * phase.speed * 1.3 + phase.offset,
            )
            height += waveX * this.params.amplitude * phase.amplitude * 0.25
        })
        return height
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.scene.remove(this.mesh)
        this.geometry.dispose()
        this.material.dispose()
    }
}