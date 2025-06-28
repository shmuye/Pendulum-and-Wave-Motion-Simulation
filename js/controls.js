import { formatNumber, debounce } from "./utils.js"

/**
 * Enhanced Controls Manager with smooth interactions
 */
export class ControlsManager {
    constructor(pendulums, waveSimulation, effects) {
        this.pendulums = pendulums
        this.waveSimulation = waveSimulation
        this.effects = effects

        this.setupControls()
        this.updateDisplayValues()
        this.setupSpecialEffects()
    }

    /**
     * Setup all control interactions
     */
    setupControls() {
        // Wave controls with smooth updates
        const waveControls = [
            { id: "amplitude", param: "amplitude", display: "amplitudeValue" },
            { id: "frequency", param: "frequency", display: "frequencyValue" },
            { id: "speed", param: "speed", display: "speedValue" },
        ]

        waveControls.forEach(({ id, param, display }) => {
            const slider = document.getElementById(id)
            const displayElement = document.getElementById(display)

            if (slider && displayElement) {
                const updateWave = debounce((value) => {
                    this.waveSimulation.updateParameters({
                        [param]: value })
                }, 16)

                slider.addEventListener("input", (e) => {
                    const value = Number.parseFloat(e.target.value)
                    displayElement.textContent = formatNumber(value)
                    updateWave(value)

                    // Visual feedback
                    this.addSliderGlow(slider)
                })
            }
        })

        // Pendulum controls with enhanced feedback
        for (let i = 1; i <= 3; i++) {
            this.setupPendulumControl(i)
        }

        // Button controls with animations
        this.setupButtons()
    }

    /**
     * Setup individual pendulum controls
     */
    setupPendulumControl(index) {
        const lengthSlider = document.getElementById(`length${index}`)
        const massSlider = document.getElementById(`mass${index}`)
        const lengthDisplay = document.getElementById(`length${index}Value`)
        const massDisplay = document.getElementById(`mass${index}Value`)

        if (lengthSlider && lengthDisplay) {
            const updateLength = debounce((value) => {
                this.pendulums[index - 1].updateProperties(value, this.pendulums[index - 1].mass)
                this.createUpdateEffect(this.pendulums[index - 1])
            }, 100)

            lengthSlider.addEventListener("input", (e) => {
                const value = Number.parseFloat(e.target.value)
                lengthDisplay.textContent = formatNumber(value)
                updateLength(value)
                this.addSliderGlow(lengthSlider)
            })
        }

        if (massSlider && massDisplay) {
            const updateMass = debounce((value) => {
                this.pendulums[index - 1].updateProperties(this.pendulums[index - 1].length, value)
                this.createUpdateEffect(this.pendulums[index - 1])
            }, 100)

            massSlider.addEventListener("input", (e) => {
                const value = Number.parseFloat(e.target.value)
                massDisplay.textContent = formatNumber(value)
                updateMass(value)
                this.addSliderGlow(massSlider)
            })
        }
    }

    /**
     * Setup button controls with enhanced effects
     */
    setupButtons() {
        const resetButton = document.getElementById("resetPendulums")
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                this.pendulums.forEach((pendulum, index) => {
                    setTimeout(() => {
                        pendulum.reset()
                        this.effects.createExplosion(pendulum.getBob().position, pendulum.color)
                    }, index * 200)
                })
                this.showFeedback("Pendulums reset with style!", "success")
            })
        }

        const pausePlayButton = document.getElementById("pausePlay")
        if (pausePlayButton) {
            pausePlayButton.addEventListener("click", () => {
                window.simulation.togglePause()
                const isPlaying = window.simulation.isPlaying
                pausePlayButton.textContent = isPlaying ? "Pause" : "Play"
                pausePlayButton.style.background = isPlaying ?
                    "linear-gradient(45deg, #ff6b6b, #ee5a52)" :
                    "linear-gradient(45deg, #4caf50, #45a049)"
                this.showFeedback(isPlaying ? "Simulation resumed" : "Simulation paused")
            })
        }

        const toggleTrailsButton = document.getElementById("toggleTrails")
        if (toggleTrailsButton) {
            toggleTrailsButton.addEventListener("click", () => {
                this.effects.toggleTrails()
                this.showFeedback("Trails toggled!", "info")
                this.addButtonPulse(toggleTrailsButton)
            })
        }

        const clearTrailsButton = document.getElementById("clearTrails")
        if (clearTrailsButton) {
            clearTrailsButton.addEventListener("click", () => {
                this.effects.clearTrails()
                this.showFeedback("Trails cleared!", "warning")
                this.addButtonPulse(clearTrailsButton)
            })
        }

        // New special effect buttons
        const syncButton = document.getElementById("syncPendulums")
        if (syncButton) {
            syncButton.addEventListener("click", () => {
                this.synchronizePendulums()
                this.showFeedback("Pendulums synchronized!", "special")
            })
        }

        const chaosButton = document.getElementById("chaosPendulums")
        if (chaosButton) {
            chaosButton.addEventListener("click", () => {
                this.createChaos()
                this.showFeedback("Chaos mode activated!", "special")
            })
        }
    }

    /**
     * Setup special effects
     */
    setupSpecialEffects() {
        // Add sync and chaos buttons to HTML if they don't exist
        const controlSection = document.querySelector(".control-section:last-child")
        if (controlSection && !document.getElementById("syncPendulums")) {
            const specialButtonGroup = document.createElement("div")
            specialButtonGroup.className = "button-group"
            specialButtonGroup.innerHTML = `
        <button id="syncPendulums" class="btn btn-special">Sync</button>
        <button id="chaosPendulums" class="btn btn-special">Chaos</button>
      `
            controlSection.appendChild(specialButtonGroup)

            // Re-setup buttons to include new ones
            this.setupButtons()
        }
    }

    /**
     * Synchronize pendulums with animation
     */
    synchronizePendulums() {
        const targetAngle = Math.PI / 4
        this.pendulums.forEach((pendulum, index) => {
            setTimeout(() => {
                pendulum.angle = targetAngle
                pendulum.angularVelocity = 0
                this.effects.createExplosion(pendulum.getBob().position, 0x00ff00)
            }, index * 300)
        })
    }

    /**
     * Create chaos effect
     */
    createChaos() {
        this.pendulums.forEach((pendulum) => {
            pendulum.angularVelocity += (Math.random() - 0.5) * 8
            this.effects.createExplosion(pendulum.getBob().position, 0xff6600)
        })
    }

    /**
     * Create visual effect when pendulum is updated
     */
    createUpdateEffect(pendulum) {
        const bobPosition = pendulum.getBob().position
        this.effects.createExplosion(bobPosition, pendulum.color)
    }

    /**
     * Add glow effect to sliders
     */
    addSliderGlow(slider) {
        slider.style.boxShadow = "0 0 10px rgba(79, 195, 247, 0.5)"
        setTimeout(() => {
            slider.style.boxShadow = ""
        }, 300)
    }

    /**
     * Add pulse effect to buttons
     */
    addButtonPulse(button) {
        button.style.transform = "scale(1.1)"
        setTimeout(() => {
            button.style.transform = ""
        }, 200)
    }

    /**
     * Update display values
     */
    updateDisplayValues() {
        const waveParams = this.waveSimulation.getParameters()

        const waveDisplays = [
            { param: "amplitude", id: "amplitudeValue" },
            { param: "frequency", id: "frequencyValue" },
            { param: "speed", id: "speedValue" },
        ]

        waveDisplays.forEach(({ param, id }) => {
            const element = document.getElementById(id)
            if (element) {
                element.textContent = formatNumber(waveParams[param])
            }
        })

        this.pendulums.forEach((pendulum, index) => {
            const i = index + 1
            const lengthElement = document.getElementById(`length${i}Value`)
            const massElement = document.getElementById(`mass${i}Value`)

            if (lengthElement) lengthElement.textContent = formatNumber(pendulum.length)
            if (massElement) massElement.textContent = formatNumber(pendulum.mass)
        })
    }

    /**
     * Enhanced feedback system
     */
    showFeedback(message, type = "info") {
        const feedback = document.createElement("div")
        feedback.textContent = message

        const colors = {
            info: "rgba(33, 150, 243, 0.9)",
            success: "rgba(76, 175, 80, 0.9)",
            warning: "rgba(255, 152, 0, 0.9)",
            special: "rgba(156, 39, 176, 0.9)",
        }

        feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${colors[type] || colors.info};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 16px;
      font-weight: 500;
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `

        document.body.appendChild(feedback)

        requestAnimationFrame(() => {
            feedback.style.opacity = "1"
            feedback.style.transform = "translate(-50%, -50%) scale(1.05)"
        })

        setTimeout(() => {
            feedback.style.opacity = "0"
            feedback.style.transform = "translate(-50%, -50%) scale(0.95)"
            setTimeout(() => feedback.remove(), 300)
        }, 2500)
    }
}