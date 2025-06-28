import * as THREE from "three"

/**
 * Pendulum class - represents a single pendulum with realistic physics
 */
export class Pendulum {
    constructor(scene, config) {
        this.scene = scene
        this.pivotX = config.x
        this.pivotY = config.y || 4
        this.pivotZ = config.z || 0
        this.length = config.length
        this.mass = config.mass
        this.color = config.color

        // Physics properties
        this.angle = Math.PI / 6 // Initial angle (30 degrees)
        this.angularVelocity = 0
        this.gravity = 9.81
        this.damping = 0.999

        // 3D objects
        this.group = new THREE.Group()
        this.pivot = null
        this.rod = null
        this.bob = null

        this.createComponents()
        this.scene.add(this.group)
    }

    /**
     * Create the 3D components of the pendulum
     */
    createComponents() {
        // Clear existing components
        this.clearComponents()

        // Create pivot point (small metallic sphere)
        const pivotGeometry = new THREE.SphereGeometry(0.05, 16, 16)
        const pivotMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 100,
            specular: 0x111111,
        })
        this.pivot = new THREE.Mesh(pivotGeometry, pivotMaterial)
        this.pivot.position.set(this.pivotX, this.pivotY, this.pivotZ)
        this.pivot.castShadow = true
        this.group.add(this.pivot)

        // Create rod (wooden cylinder)
        const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, this.length, 8)
        const rodMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 30,
            specular: 0x222222,
        })
        this.rod = new THREE.Mesh(rodGeometry, rodMaterial)
        this.rod.castShadow = true
        this.group.add(this.rod)

        // Create bob (metallic sphere with size based on mass)
        const bobRadius = 0.1 + (this.mass - 0.5) * 0.05
        const bobGeometry = new THREE.SphereGeometry(bobRadius, 32, 32)
        const bobMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 100,
            specular: 0x444444,
            reflectivity: 0.3,
        })
        this.bob = new THREE.Mesh(bobGeometry, bobMaterial)
        this.bob.userData = { pendulum: this }
        this.bob.castShadow = true
        this.group.add(this.bob)

        this.updatePosition()
    }

    /**
     * Clear existing components
     */
    clearComponents() {
        while (this.group.children.length > 0) {
            const child = this.group.children[0]
            this.group.remove(child)
            if (child.geometry) child.geometry.dispose()
            if (child.material) child.material.dispose()
        }
    }

    /**
     * Update the position of pendulum components based on current angle
     */
    updatePosition() {
        const bobX = this.pivotX + Math.sin(this.angle) * this.length
        const bobY = this.pivotY - Math.cos(this.angle) * this.length

        // Update bob position
        this.bob.position.set(bobX, bobY, this.pivotZ)

        // Update rod position and rotation
        this.rod.position.set(
            this.pivotX + (Math.sin(this.angle) * this.length) / 2,
            this.pivotY - (Math.cos(this.angle) * this.length) / 2,
            this.pivotZ,
        )
        this.rod.rotation.z = this.angle
    }

    /**
     * Update pendulum physics
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        // Simple pendulum physics: θ'' = -(g/L) * sin(θ)
        const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle)

        this.angularVelocity += angularAcceleration * deltaTime
        this.angularVelocity *= this.damping // Apply damping
        this.angle += this.angularVelocity * deltaTime

        this.updatePosition()
    }

    /**
     * Set pendulum angle based on world position (for dragging)
     * @param {THREE.Vector3} worldPosition - World position to set angle from
     */
    setAngleFromPosition(worldPosition) {
        const dx = worldPosition.x - this.pivotX
        const dy = worldPosition.y - this.pivotY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Constrain to pendulum length and set angle
        if (distance > 0) {
            this.angle = Math.atan2(dx, -dy)
            this.angularVelocity = 0 // Reset velocity when dragging
        }
    }

    /**
     * Reset pendulum to initial state
     */
    reset() {
        this.angle = Math.PI / 6
        this.angularVelocity = 0
        this.updatePosition()
    }

    /**
     * Update pendulum properties and recreate components
     * @param {number} length - New length
     * @param {number} mass - New mass
     */
    updateProperties(length, mass) {
        this.length = length
        this.mass = mass
        this.createComponents()
    }

    /**
     * Get the bob mesh for raycasting
     * @returns {THREE.Mesh} The bob mesh
     */
    getBob() {
        return this.bob
    }

    /**
     * Get pendulum energy (kinetic + potential)
     * @returns {number} Total energy
     */
    getEnergy() {
        const height = this.pivotY - this.bob.position.y
        const velocity = this.angularVelocity * this.length
        const kineticEnergy = 0.5 * this.mass * velocity * velocity
        const potentialEnergy = this.mass * this.gravity * height
        return kineticEnergy + potentialEnergy
    }

    /**
     * Dispose of the pendulum and remove from scene
     */
    dispose() {
        this.clearComponents()
        this.scene.remove(this.group)
    }
}
