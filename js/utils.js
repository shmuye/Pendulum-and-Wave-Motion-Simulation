/**
 * Utility functions for the simulation
 */

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

export function lerp(start, end, factor) {
    return start + (end - start) * factor
}

export function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

export function degToRad(degrees) {
    return (degrees * Math.PI) / 180
}

export function radToDeg(radians) {
    return (radians * 180) / Math.PI
}

export function createWaterTexture() {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")

    // Create water-like gradient
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, "#4a90e2")
    gradient.addColorStop(0.5, "#357abd")
    gradient.addColorStop(1, "#1e5f99")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    // Add noise for texture
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256
        const y = Math.random() * 256
        const size = Math.random() * 3
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
        ctx.fillRect(x, y, size, size)
    }

    return canvas
}

export function formatNumber(num, decimals = 1) {
    return Number(num).toFixed(decimals)
}

export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
