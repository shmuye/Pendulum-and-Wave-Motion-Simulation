import * as THREE from "three"

/**
 * Enhanced Effects System with beautiful animations
 */
export class EffectsSystem {
    constructor(scene) {
        this.scene = scene
        this.effects = []
        this.trails = []
        this.time = 0

        this.createFloatingParticles()
        this.createEnergyRings()
    }

    /**
     * Create floating ambient particles
     */
    createFloatingParticles() {
        const particleCount = 150
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        const sizes = new Float32Array(particleCount)

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3

            // Distribute particles in a nice pattern
            positions[i3] = (Math.random() - 0.5) * 25
            positions[i3 + 1] = Math.random() * 12 + 1
            positions[i3 + 2] = (Math.random() - 0.5) * 15

            // Beautiful color palette
            const hue = 0.5 + Math.random() * 0.4
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
            colors[i3] = color.r
            colors[i3 + 1] = color.g
            colors[i3 + 2] = color.b

            sizes[i] = Math.random() * 0.15 + 0.05
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
        })

        const particles = new THREE.Points(geometry, material)
        this.scene.add(particles)

        this.effects.push({
            type: "particles",
            mesh: particles,
            originalPositions: positions.slice(),
        })
    }

    /**
     * Create energy rings around pendulums
     */
    createEnergyRings() {
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(0.8, 1.0, 32)
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: [0xff4444, 0x44ff44, 0x4444ff][i],
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
            })

            const ring = new THREE.Mesh(ringGeometry, ringMaterial)
            ring.position.set([-2, 0, 2][i], 1, 0)
            ring.rotation.x = -Math.PI / 2

            this.scene.add(ring)

            this.effects.push({
                type: "ring",
                mesh: ring,
                originalY: ring.position.y,
                phase: i * Math.PI * 0.66,
            })
        }
    }

    /**
     * Add trail system for pendulum
     */
    addTrail(pendulum) {
        const trail = {
            positions: [],
            geometry: new THREE.BufferGeometry(),
            material: new THREE.LineBasicMaterial({
                color: pendulum.color,
                transparent: true,
                opacity: 0.7,
                linewidth: 2,
            }),
            line: null,
            pendulum: pendulum,
            maxLength: 60,
        }

        const positions = new Float32Array(trail.maxLength * 3)
        trail.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        trail.geometry.setDrawRange(0, 0)

        trail.line = new THREE.Line(trail.geometry, trail.material)
        this.scene.add(trail.line)
        this.trails.push(trail)
    }

    /**
     * Update all effects with smooth animations
     */
    update(deltaTime, pendulums) {
        this.time += deltaTime

        // Update particles with floating motion
        this.effects.forEach((effect) => {
            if (effect.type === "particles") {
                const positions = effect.mesh.geometry.attributes.position.array
                for (let i = 0; i < positions.length; i += 3) {
                    // Floating animation
                    positions[i + 1] =
                        effect.originalPositions[i + 1] +
                        Math.sin(this.time * 0.5 + positions[i] * 0.1) * 0.8 +
                        Math.cos(this.time * 0.3 + positions[i + 2] * 0.1) * 0.3

                    // Gentle horizontal drift
                    positions[i] += Math.sin(this.time * 0.2 + positions[i + 1] * 0.1) * 0.01
                }
                effect.mesh.geometry.attributes.position.needsUpdate = true
            }

            if (effect.type === "ring") {
                // Floating rings animation
                effect.mesh.position.y = effect.originalY + Math.sin(this.time * 2 + effect.phase) * 0.3
                effect.mesh.rotation.z += deltaTime * 0.5

                // Pulsing opacity
                effect.mesh.material.opacity = 0.2 + Math.sin(this.time * 3 + effect.phase) * 0.15

                // Scale pulsing
                const scale = 1 + Math.sin(this.time * 4 + effect.phase) * 0.1
                effect.mesh.scale.setScalar(scale)
            }
        })

        // Update trails with fade effect
        if (pendulums) {
            this.trails.forEach((trail, index) => {
                if (pendulums[index]) {
                    const bob = pendulums[index].getBob()
                    trail.positions.push(bob.position.clone())

                    if (trail.positions.length > trail.maxLength) {
                        trail.positions.shift()
                    }

                    const positions = trail.geometry.attributes.position.array
                    for (let i = 0; i < trail.positions.length; i++) {
                        const pos = trail.positions[i]
                        positions[i * 3] = pos.x
                        positions[i * 3 + 1] = pos.y
                        positions[i * 3 + 2] = pos.z
                    }

                    trail.geometry.setDrawRange(0, trail.positions.length)
                    trail.geometry.attributes.position.needsUpdate = true

                    // Animate trail opacity based on pendulum energy
                    const energy = pendulums[index].getEnergy()
                    trail.material.opacity = 0.4 + (energy / 20) * 0.4
                }
            })
        }
    }

    /**
     * Toggle trails visibility
     */
    toggleTrails() {
        this.trails.forEach((trail) => {
            trail.line.visible = !trail.line.visible
        })
    }

    /**
     * Clear all trails
     */
    clearTrails() {
        this.trails.forEach((trail) => {
            trail.positions = []
            trail.geometry.setDrawRange(0, 0)
        })
    }

    /**
     * Create explosion effect at position
     */
    createExplosion(position, color = 0xffffff) {
        const particleCount = 30
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const velocities = []

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3
            positions[i3] = position.x
            positions[i3 + 1] = position.y
            positions[i3 + 2] = position.z

            velocities.push(
                new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
            )
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.1,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
        })

        const explosion = new THREE.Points(geometry, material)
        this.scene.add(explosion)

        // Animate explosion
        let life = 1.0
        const animate = () => {
            life -= 0.02
            if (life <= 0) {
                this.scene.remove(explosion)
                geometry.dispose()
                material.dispose()
                return
            }

            const positions = geometry.attributes.position.array
            for (let i = 0; i < velocities.length; i++) {
                const i3 = i * 3
                positions[i3] += velocities[i].x * 0.02
                positions[i3 + 1] += velocities[i].y * 0.02
                positions[i3 + 2] += velocities[i].z * 0.02
            }

            geometry.attributes.position.needsUpdate = true
            material.opacity = life
            material.size = 0.1 * life

            requestAnimationFrame(animate)
        }
        animate()
    }

    /**
     * Dispose all effects
     */
    dispose() {
        this.effects.forEach((effect) => {
            this.scene.remove(effect.mesh)
            effect.mesh.geometry.dispose()
            effect.mesh.material.dispose()
        })

        this.trails.forEach((trail) => {
            this.scene.remove(trail.line)
            trail.geometry.dispose()
            trail.material.dispose()
        })
    }
}