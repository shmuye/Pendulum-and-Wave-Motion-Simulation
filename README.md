# Pendulum and Wave Motion Simulation

This repository contains an interactive 3D web-based simulation that demonstrates two fundamental concepts in physics: pendulum motion and wave propagation.

Built with Three.js, this application provides a visual and engaging way to understand oscillatory motion and wave dynamics in real time.

## Project Overview

The primary goal of this project is to create an intuitive and interactive simulation that allows users to explore and observe the behavior of a realistic pendulum and a dynamic wave pattern.

The pendulum's motion is based on sine wave functions, and the wave simulation uses multiple oscillating objects to form a smooth wave.

## Features

- **Realistic Pendulum Simulation**: Features a bob and rod connected to a pivot, animated using trigonometric functions.
- **Dynamic Wave Simulation**: Multiple animated bars driven by sine functions simulate smooth wave propagation.
- **Interactive Camera Controls**: Users can explore the 3D scene from different angles using OrbitControls.
- **Basic Lighting**: Includes ambient and directional lights for enhanced realism.
- **Math-Driven Animation**: All 3D objects are animated based on mathematical principles.
- **Real-time Rendering**: Immediate visual feedback from WebGL rendering.
- **User Interaction (Planned)**: Future enhancements will allow adjustment of pendulum parameters (length, mass, damping) and wave properties (amplitude, frequency).

## 🛠️ Technologies Used

- **Three.js** – For 3D rendering and scene management.
- **JavaScript (ES6)** – For core logic and animations.
- **HTML/CSS** – For layout and canvas rendering.
- **VS Code** – Development environment.
- **Git & GitHub** – Version control and source code hosting.
- **GitHub Pages** – For hosting the live demo.

## 🧱 Planned 3D Objects

1. **Pendulum Bob** – A spherical object representing the swinging mass.
2. **Pendulum Rod** – A cylindrical object connecting the bob to the pivot.
3. **Pendulum Pivot** – A fixed anchor point for the rod.
4. **Wave Bars** – A group of boxes that oscillate to simulate wave-like motion.
5. **Ground Plane** – A textured base for context in the scene.

## 🧪 Methodology

### 1. Scene Setup

- Establish the 3D environment with the pendulum system and wave objects.

### 2. Physics Implementation

- Use trigonometric functions (sine/cosine) for pendulum swinging.
- Use time-based sine displacement for wave motion.

### 3. User Interaction _(Planned)_

- Enable users to modify pendulum and wave properties like amplitude, frequency, length, etc.

### 4. Visual Enhancements

- Add textures and lighting.
- Integrate OrbitControls for camera navigation.

### 5. Testing & Optimization

- Ensure performance is smooth across browsers and devices.

---

### 📦 Installation

1. Clone the repository:

- git clone https://github.com/shmuye/Pendulum-and-Wave-Motion-Simulation.git
- cd Pendulum-and-Wave-Motion-Simulation
  2,Install dependencies:
- npm install

## Team Members

### 1,Dawit Misgna (UGR/8170/15)

### 2,Girma Enkuchile (UGR/8130/15)

### 3,Shmuye Ayalneh (UGR/7284/15)

### 4,Solome Zewdu (UGR/4112/14)

### 5,Tinania Tigneh (UGR/8453/15)

## 🖥️ Live Demo

Check out the simulation in action:  
[View Live Demo](https://moonlit-macaron-59fafa.netlify.app/)


