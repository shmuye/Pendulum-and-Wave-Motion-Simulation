import * as THREE from "three"
export class Pendulum {
    constructor(scene, config) {
        this.scene = scene
        this.pivotX = config.x
        this.pivotY = config.y || 4
        this.pivotZ = config.z || 0
        this.length = config.length
        this.mass = config.mass
        this.color = config.color

        this.angle = Math.PI / 6
        this.angularVelocity = 0
        this.gravity = 9.81
        this.damping = 0.999

        this.time = 0
        this.glowIntensity = 0

        this.group = new THREE.Group()
        this.pivot = null
        this.rod = null
        this.bob = null
        this.glowSphere = null

        this.createComponents()
        this.scene.add(this.group)
    }


    createComponents() {
        // Pivot point
        const pivotGeometry = new THREE.SphereGeometry(0.05, 16, 16)
        const pivotMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 100,
        })
        this.pivot = new THREE.Mesh(pivotGeometry, pivotMaterial)
        this.pivot.position.set(this.pivotX, this.pivotY, this.pivotZ)
        this.pivot.castShadow = true
        this.group.add(this.pivot)

        // Rod with metallic look
        const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, this.length, 8)
        const rodMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 50,
            specular: 0x444444,
        })
        this.rod = new THREE.Mesh(rodGeometry, rodMaterial)
        this.rod.castShadow = true
        this.group.add(this.rod)

        // Bob with enhanced materials
        const bobRadius = 0.1 + (this.mass - 0.5) * 0.05
        const bobGeometry = new THREE.SphereGeometry(bobRadius, 32, 32)
        const bobMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 100,
            specular: 0x444444,
            emissive: new THREE.Color(this.color).multiplyScalar(0.1),
        })
        this.bob = new THREE.Mesh(bobGeometry, bobMaterial)
        this.bob.userData = { pendulum: this }
        this.bob.castShadow = true
        this.group.add(this.bob)

        // Glow sphere for energy visualization
        const glowGeometry = new THREE.SphereGeometry(bobRadius * 1.5, 16, 16)
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
        })
        this.glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
        this.bob.add(this.glowSphere)

        this.updatePosition()
    }

    /**
     * Update position with smooth animations
     */
    updatePosition() {
        const bobX = this.pivotX + Math.sin(this.angle) * this.length
        const bobY = this.pivotY - Math.cos(this.angle) * this.length

        // Smooth bob movement
        this.bob.position.set(bobX, bobY, this.pivotZ)

        // Rod positioning and rotation
        this.rod.position.set(
            this.pivotX + (Math.sin(this.angle) * this.length) / 2,
            this.pivotY - (Math.cos(this.angle) * this.length) / 2,
            this.pivotZ,
        )
        this.rod.rotation.z = this.angle

        // Add subtle bob rotation
        this.bob.rotation.y += 0.01
    }

    /**
     * Update physics with enhanced animations
     */
    update(deltaTime) {
        this.time += deltaTime

        // Physics calculation
        const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle)
        this.angularVelocity += angularAcceleration * deltaTime
        this.angularVelocity *= this.damping
        this.angle += this.angularVelocity * deltaTime

        // Update glow based on velocity
        const velocity = Math.abs(this.angularVelocity)
        this.glowIntensity = velocity * 0.3

        // Animate emissive color
        const emissiveIntensity = 0.1 + this.glowIntensity * 0.2
        this.bob.material.emissive.copy(new THREE.Color(this.color)).multiplyScalar(emissiveIntensity)

        // Update glow sphere
        this.glowSphere.material.opacity = this.glowIntensity * 0.3
        this.glowSphere.scale.setScalar(1 + Math.sin(this.time * 5) * 0.1)

        // Add subtle bob pulsing
        const pulseScale = 1 + Math.sin(this.time * 3) * 0.05
        this.bob.scale.setScalar(pulseScale)

        this.updatePosition()
    }

    /**
     * Set angle from world position (for dragging)
     */
    setAngleFromPosition(worldPosition) {
        const dx = worldPosition.x - this.pivotX
        const dy = worldPosition.y - this.pivotY
        if (Math.sqrt(dx * dx + dy * dy) > 0) {
            this.angle = Math.atan2(dx, -dy)
            this.angularVelocity = 0
        }
    }

    /**
     * Reset with animation
     */
    reset() {
        this.angle = Math.PI / 6
        this.angularVelocity = 0
        this.glowIntensity = 0
        this.updatePosition()
    }

    /**
     * Update properties with smooth transition
     */
    updateProperties(length, mass) {
        this.length = length
        this.mass = mass
        this.createComponents()
    }

    /**
     * Get bob for interaction
     */
    getBob() {
        return this.bob
    }

    /**
     * Get energy for visualization
     */
    getEnergy() {
        const height = this.pivotY - this.bob.position.y
        const velocity = this.angularVelocity * this.length
        return 0.5 * this.mass * velocity * velocity + this.mass * this.gravity * height
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.scene.remove(this.group)
        this.group.traverse((child) => {
            if (child.geometry) child.geometry.dispose()
            if (child.material) child.material.dispose()
        })
    }
}