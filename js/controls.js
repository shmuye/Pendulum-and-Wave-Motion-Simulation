import { formatNumber, debounce } from "./utils.js"

/**
 * GUI Controls manager - handles all user interface interactions
 */
export class ControlsManager {
    constructor(pendulums, waveSimulation, simulationControls) {
        this.pendulums = pendulums
        this.waveSimulation = waveSimulation
        this.simulationControls = simulationControls

        this.setupWaveControls()
        this.setupPendulumControls()
        this.setupSimulationControls()
        this.updateDisplayValues()
    }

    /**
     * Setup wave parameter controls
     */
    setupWaveControls() {
        const controls = [
            { id: "amplitude", param: "amplitude", display: "amplitudeValue" },
            { id: "frequency", param: "frequency", display: "frequencyValue" },
            { id: "speed", param: "speed", display: "speedValue" },
        ]

        controls.forEach(({ id, param, display }) => {
            const slider = document.getElementById(id)
            const displayElement = document.getElementById(display)

            if (slider && displayElement) {
                const updateWave = debounce((value) => {
                    this.waveSimulation.updateParameters({ [param]: value })
                }, 16)

                slider.addEventListener("input", (e) => {
                    const value = Number.parseFloat(e.target.value)
                    displayElement.textContent = formatNumber(value)
                    updateWave(value)
                })
            }
        })
    }

    /**
     * Setup pendulum parameter controls
     */
    setupPendulumControls() {
        for (let i = 1; i <= 3; i++) {
            const lengthSlider = document.getElementById(`length${i}`)
            const massSlider = document.getElementById(`mass${i}`)
            const lengthDisplay = document.getElementById(`length${i}Value`)
            const massDisplay = document.getElementById(`mass${i}Value`)

            if (lengthSlider && lengthDisplay) {
                const updateLength = debounce((value) => {
                    this.pendulums[i - 1].updateProperties(value, this.pendulums[i - 1].mass)
                }, 100)

                lengthSlider.addEventListener("input", (e) => {
                    const value = Number.parseFloat(e.target.value)
                    lengthDisplay.textContent = formatNumber(value)
                    updateLength(value)
                })
            }

            if (massSlider && massDisplay) {
                const updateMass = debounce((value) => {
                    this.pendulums[i - 1].updateProperties(this.pendulums[i - 1].length, value)
                }, 100)

                massSlider.addEventListener("input", (e) => {
                    const value = Number.parseFloat(e.target.value)
                    massDisplay.textContent = formatNumber(value)
                    updateMass(value)
                })
            }
        }
    }

    /**
     * Setup simulation control buttons
     */
    setupSimulationControls() {
        // Reset pendulums button
        const resetButton = document.getElementById("resetPendulums")
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                this.pendulums.forEach((pendulum) => pendulum.reset())
                this.showFeedback("Pendulums reset!")
            })
        }

        // Pause/Play button
        const pausePlayButton = document.getElementById("pausePlay")
        if (pausePlayButton) {
            pausePlayButton.addEventListener("click", () => {
                this.simulationControls.togglePause()
                pausePlayButton.textContent = this.simulationControls.isPlaying ? "Pause" : "Play"
                this.showFeedback(this.simulationControls.isPlaying ? "Simulation resumed" : "Simulation paused")
            })
        }
    }

    /**
     * Update control values from current simulation state
     */
    updateDisplayValues() {
        const waveParams = this.waveSimulation.getParameters()

        // Update wave displays
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

        // Update pendulum displays
        this.pendulums.forEach((pendulum, index) => {
            const i = index + 1
            const lengthElement = document.getElementById(`length${i}Value`)
            const massElement = document.getElementById(`mass${i}Value`)

            if (lengthElement) lengthElement.textContent = formatNumber(pendulum.length)
            if (massElement) massElement.textContent = formatNumber(pendulum.mass)
        })
    }

    /**
     * Show user feedback
     * @param {string} message - Feedback message
     */
    showFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement("div")
        feedback.textContent = message
        feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      z-index: 1000;
      font-size: 14px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `

        document.body.appendChild(feedback)

        // Animate in
        requestAnimationFrame(() => {
            feedback.style.opacity = "1"
        })

        // Remove after delay
        setTimeout(() => {
            feedback.style.opacity = "0"
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback)
                }
            }, 300)
        }, 2000)
    }

    /**
     * Get current control values
     * @returns {Object} Current control values
     */
    getControlValues() {
        return {
            wave: this.waveSimulation.getParameters(),
            pendulums: this.pendulums.map((p) => ({
                length: p.length,
                mass: p.mass,
                angle: p.angle,
                energy: p.getEnergy(),
            })),
        }
    }
}
