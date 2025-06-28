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

export function normalize(value, min, max) {
    return (value - min) / (max - min)
}

export function smoothstep(min, max, value) {
    const x = clamp((value - min) / (max - min), 0, 1)
    return x * x * (3 - 2 * x)
}

export function smootherstep(min, max, value) {
    const x = clamp((value - min) / (max - min), 0, 1)
    return x * x * x * (x * (x * 6 - 15) + 10)
}

export const easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    easeInElastic: (t) => {
        const c4 = (2 * Math.PI) / 3
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
    },
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    },
    easeInBounce: (t) => 1 - easing.easeOutBounce(1 - t),
    easeOutBounce: (t) => {
        const n1 = 7.5625
        const d1 = 2.75
        if (t < 1 / d1) return n1 * t * t
        else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
        else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
        else return n1 * (t -= 2.625 / d1) * t + 0.984375
    },
}

export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    static distance(a, b) {
        const dx = a.x - b.x
        const dy = a.y - b.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    static angle(a, b) {
        return Math.atan2(b.y - a.y, b.x - a.x)
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize() {
        const len = this.length()
        if (len > 0) {
            this.x /= len
            this.y /= len
        }
        return this
    }

    clone() {
        return new Vector2(this.x, this.y)
    }
}

export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x
        this.y = y
        this.z = z
    }

    static distance(a, b) {
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dz = a.z - b.z
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    normalize() {
        const len = this.length()
        if (len > 0) {
            this.x /= len
            this.y /= len
            this.z /= len
        }
        return this
    }

    clone() {
        return new Vector3(this.x, this.y, this.z)
    }
}

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ?
        {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
        } :
        null
}

export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export function hslToRgb(h, s, l) {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    if (s === 0) {
        return { r: l * 255, g: l * 255, b: l * 255 }
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    }
}

export function interpolateColor(color1, color2, factor) {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)

    if (!rgb1 || !rgb2) return color1

    const r = Math.round(lerp(rgb1.r, rgb2.r, factor))
    const g = Math.round(lerp(rgb1.g, rgb2.g, factor))
    const b = Math.round(lerp(rgb1.b, rgb2.b, factor))

    return rgbToHex(r, g, b)
}

export function getRandomColor() {
    const hue = Math.random() * 360
    const saturation = 70 + Math.random() * 30
    const lightness = 50 + Math.random() * 30
    return hslToRgb(hue, saturation, lightness)
}

export function random(min = 0, max = 1) {
    return Math.random() * (max - min) + min
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
}

export function randomGaussian(mean = 0, stdDev = 1) {
    let u = 0,
        v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export function shuffle(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export function calculatePendulumPeriod(length, gravity = 9.81) {
    return 2 * Math.PI * Math.sqrt(length / gravity)
}

export function calculateWaveSpeed(frequency, wavelength) {
    return frequency * wavelength
}

export function dampingForce(velocity, dampingCoefficient) {
    return -dampingCoefficient * velocity
}

export function springForce(displacement, springConstant) {
    return -springConstant * displacement
}

export function gravitationalForce(mass1, mass2, distance, G = 6.674e-11) {
    return (G * (mass1 * mass2)) / (distance * distance)
}

export function createWaterTexture(width = 256, height = 256) {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    // Enhanced water gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
    gradient.addColorStop(0, "#4a90e2")
    gradient.addColorStop(0.3, "#357abd")
    gradient.addColorStop(0.7, "#2c5aa0")
    gradient.addColorStop(1, "#1e5f99")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add realistic water noise
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 2 + 0.5
        const opacity = Math.random() * 0.4
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fillRect(x, y, size, size)
    }

    // Add wave patterns
    ctx.globalCompositeOperation = "overlay"
    for (let i = 0; i < 5; i++) {
        const gradient2 = ctx.createLinearGradient(0, (i * height) / 5, width, ((i + 1) * height) / 5)
        gradient2.addColorStop(0, `rgba(255, 255, 255, ${0.1 * Math.random()})`)
        gradient2.addColorStop(1, `rgba(0, 100, 200, ${0.1 * Math.random()})`)
        ctx.fillStyle = gradient2
        ctx.fillRect(0, (i * height) / 5, width, height / 5)
    }

    return canvas
}

export function createNoiseTexture(width = 256, height = 256, scale = 1) {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    const imageData = ctx.createImageData(width, height)

    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 255 * scale
        imageData.data[i] = noise // R
        imageData.data[i + 1] = noise // G
        imageData.data[i + 2] = noise // B
        imageData.data[i + 3] = 255 // A
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

export function createGradientTexture(colors, width = 256, height = 256, direction = "horizontal") {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    const gradient =
        direction === "horizontal" ? ctx.createLinearGradient(0, 0, width, 0) : ctx.createLinearGradient(0, 0, 0, height)

    colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    return canvas
}

export function throttle(func, limit) {
    let inThrottle
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function memoize(fn) {
    const cache = new Map()
    return function(...args) {
        const key = JSON.stringify(args)
        if (cache.has(key)) {
            return cache.get(key)
        }
        const result = fn.apply(this, args)
        cache.set(key, result)
        return result
    }
}

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function getTimestamp() {
    return Date.now()
}

export function deltaTime(lastTime) {
    const now = performance.now()
    const delta = (now - lastTime) / 1000
    return { delta, now }
}

export function formatNumber(num, decimals = 1) {
    if (typeof num !== "number" || isNaN(num)) return "0.0"
    return Number(num).toFixed(decimals)
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function formatPercentage(value, total, decimals = 1) {
    if (total === 0) return "0%"
    return ((value / total) * 100).toFixed(decimals) + "%"
}

export function isNumber(value) {
    return typeof value === "number" && !isNaN(value) && isFinite(value)
}

export function isInRange(value, min, max) {
    return isNumber(value) && value >= min && value <= max
}

export function sanitizeInput(value, min, max, defaultValue) {
    const num = Number.parseFloat(value)
    if (!isNumber(num)) return defaultValue
    return clamp(num, min, max)
}

export class AnimationManager {
    constructor() {
        this.animations = new Map()
        this.isRunning = false
    }

    add(id, startValue, endValue, duration, easingFunc = easing.linear, onUpdate, onComplete) {
        this.animations.set(id, {
            startValue,
            endValue,
            duration,
            easingFunc,
            onUpdate,
            onComplete,
            startTime: performance.now(),
            isComplete: false,
        })

        if (!this.isRunning) {
            this.start()
        }
    }

    remove(id) {
        this.animations.delete(id)
        if (this.animations.size === 0) {
            this.stop()
        }
    }

    start() {
        this.isRunning = true
        this.update()
    }

    stop() {
        this.isRunning = false
    }

    update() {
        if (!this.isRunning) return

        const now = performance.now()

        for (const [id, animation] of this.animations) {
            if (animation.isComplete) continue

            const elapsed = now - animation.startTime
            const progress = Math.min(elapsed / animation.duration, 1)
            const easedProgress = animation.easingFunc(progress)
            const currentValue = lerp(animation.startValue, animation.endValue, easedProgress)

            animation.onUpdate(currentValue, progress)

            if (progress >= 1) {
                animation.isComplete = true
                if (animation.onComplete) {
                    animation.onComplete()
                }
                this.remove(id)
            }
        }

        if (this.isRunning) {
            requestAnimationFrame(() => this.update())
        }
    }
}

export const animationManager = new AnimationManager()

export function debounce(func, delay) {
    let timeout
    return function(...args) {

        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), delay)
    }
}

// Backward compatibility