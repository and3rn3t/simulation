# Organism Simulation Game

A web-based interactive simulation that demonstrates how different organisms multiply and divide over time. Watch as populations grow, evolve, and respond to environmental factors with realistic growth and death rates.

## Features

- **Multiple Organism Types**: Choose from bacteria, yeast, algae, and viruses, each with unique characteristics
- **Real-time Visualization**: Watch organisms multiply and move in real-time on HTML5 Canvas
- **Interactive Controls**: Adjust simulation speed, pause, reset, and switch between organism types
- **Population Statistics**: Track population size, generation count, and elapsed time
- **Responsive Design**: Works on desktop and mobile devices

## Organism Types

- **Bacteria** 🦠: Fast-growing single-celled organisms (High growth rate, low death rate)
- **Yeast** 🟡: Fungal cells with moderate growth (Medium growth rate, low death rate)
- **Algae** 🔵: Photosynthetic organisms with slow growth (Low growth rate, very low death rate)
- **Virus** 🔴: Rapidly replicating infectious agents (Very high growth rate, high death rate)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Performance Optimizations

This simulation includes several performance optimizations:

### 🚀 **Rendering Optimizations**

- **Batched Drawing**: Organisms are grouped by type and drawn in batches to minimize context switches
- **Frame Rate Limiting**: Capped at 60 FPS to prevent unnecessary CPU usage
- **Efficient Grid Rendering**: Grid is drawn with a single stroke operation
- **Canvas Caching**: Canvas dimensions are cached to avoid repeated DOM queries

### 🧠 **Memory Management**

- **Object Pooling**: Pre-allocated arrays for new organisms and removal indices
- **Efficient Removal**: Dead organisms are removed in batches to minimize array operations
- **Color Caching**: Organism colors are cached and only updated when opacity changes significantly
- **Population Limiting**: Configurable maximum population to prevent memory overflow

### ⚡ **Algorithm Optimizations**

- **Early Exit Conditions**: Death checks exit early when age exceeds maximum
- **Reduced Random Calls**: Movement calculations are optimized to reduce Math.random() calls
- **Efficient Bounds Checking**: Canvas bounds are cached and reused
- **Optimized Loops**: Forward loops for updates, reverse loops for removals

### 📊 **Performance Monitoring**

- **Real-time FPS Counter**: Monitor simulation performance
- **Population Limit Control**: Adjust maximum population for your hardware
- **Performance Metrics**: Built-in monitoring for updates and renders

## Controls

1. **Select an Organism**: Choose from the dropdown menu to see different growth patterns
2. **Adjust Speed**: Use the speed slider to control how fast the simulation runs
3. **Control Simulation**: Use Start, Pause, and Reset buttons to control the simulation
4. **Monitor Stats**: Watch the population count, generation number, and elapsed time

## Technology Stack

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript for better development experience
- **HTML5 Canvas**: High-performance 2D graphics rendering
- **CSS3**: Modern styling with gradients and animations

## Project Structure

src/
├── main.ts              # Main application entry point
├── simulation.ts        # Core simulation engine
├── organism.ts          # Organism class definition
├── organismTypes.ts     # Organism type configurations

```text
└── style.css           # Application styles
```

├── main.ts              # Main application entry point
├── simulation.ts        # Core simulation engine
├── organism.ts          # Organism class definition
├── organismTypes.ts     # Organism type configurations
└── style.css           # Application styles

```text

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for educational purposes!
