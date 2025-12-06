# 3D Workspace Designer ✨

A powerful, interactive 3D workspace layout application that lets users design and organize their perfect desk or room setup using detailed 3D objects. Built with Next.js, React Three Fiber, Zustand, and TypeScript.

![3D Workspace Designer](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-Latest-green?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=flat-square)

## ✨ Features

### Core Capabilities

- **🔍 Object Search & Browse**: Search through a comprehensive library of 12 detailed 3D objects including desks, monitors, computers, accessories, plants, and more
- **🎨 Click to Add**: Simple click-to-add interface from the object library
- **🔄 Transform Controls**: Professional transform controls for moving, rotating, and scaling objects with visual gizmos
- **⌨️ Keyboard Shortcuts**: Quick access with **G** (Move), **R** (Rotate), **S** (Scale), and **Delete/Backspace** to remove objects
- **🎯 Interactive Selection**: Click objects to select and edit their properties with visual highlights
- **💾 Persistent Storage**: Automatic workspace persistence using localStorage with Zustand middleware
- **📸 Export**: Export high-quality screenshots of your 3D workspace or full page captures
- **🎛️ Properties Panel**: Fine-tune object position, rotation, scale, and color with sliders and inputs
- **🎨 Detailed 3D Models**: Realistic 3D object geometries with proper materials, shadows, and lighting

### Object Library

The application includes 12 highly detailed 3D objects across 3 categories:

- **Furniture**: Desk (with legs), Chair (with wheels), Shelf
- **Tech**: Monitor (with stand and screen glow), PC Tower (with RGB LED), Keyboard, Mouse, Headphones, Speaker
- **Accessories**: Lamp (with light source), Plant (with pot and leaves), Coffee Mug (with handle)

Each object features:
- **Realistic geometry** with multiple mesh components
- **Material properties** including metalness, roughness, and emissive lighting
- **Proper shadows** and light interactions
- **Detailed sub-components** (e.g., monitor stand, PC vents, chair wheels)

### User Interface

- **Header Bar**: Application branding with visible keyboard shortcut hints
- **Object Library Panel**: Frosted glass design with category filtering (All, Furniture, Tech, Accessories)
- **Toolbar**: Centered toolbar with transform mode buttons, object actions (duplicate, delete), and clear workspace
- **Properties Panel**: Right-side panel with sliders for rotation and scale, precise inputs for position
- **Export Buttons**: Convenient bottom-right buttons for exporting screenshots
- **Frosted Glass UI**: Modern glassmorphism design with backdrop blur effects
- **Keyboard Shortcuts Display**: Always-visible keyboard hints in the header

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-setup
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Use

### Adding Objects

1. Browse the **Object Library** on the left
2. Use the search bar or category filters (All, Furniture, Tech, Accessories)
3. Click on any object card to add it to your scene
4. The object will appear at the center with automatic selection

### Manipulating Objects

1. **Select**: Click on any object in the 3D scene to select it (shows cyan wireframe)
2. **Move** (Keyboard: **G**): Click the Move button in toolbar, then drag the transform gizmo
3. **Rotate** (Keyboard: **R**): Click Rotate button, use the rotation gizmo, or adjust in Properties panel
4. **Scale** (Keyboard: **S**): Click Scale button, use the gizmo, or adjust the slider in Properties panel
5. **Delete** (Keyboard: **Delete** or **Backspace**): Click the delete button in toolbar or press Delete key
6. **Duplicate**: Click the duplicate button in toolbar or Properties panel to copy selected object

### Camera Controls

- **Rotate View**: Left-click and drag to orbit around the scene
- **Pan View**: Right-click and drag to pan
- **Zoom**: Use mouse scroll wheel to zoom in/out (limited between 2-20 units)
- **Auto-save**: Workspace automatically persists to localStorage

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **G** | Switch to Move/Translate mode |
| **R** | Switch to Rotate mode |
| **S** | Switch to Scale mode |
| **Delete** / **Backspace** | Delete selected object |
| Click empty space | Deselect object |

### Exporting

- **Export View**: Captures just the 3D scene
- **Export Full**: Captures the entire application including UI panels

## 🏗️ Project Structure

```
my-setup/
├── app/
│   ├── components/          # React components
│   │   ├── Scene.tsx       # Main 3D scene with Three.js
│   │   ├── DraggableObject.tsx  # Interactive 3D objects
│   │   ├── Ground.tsx      # Ground plane
│   │   ├── ObjectLibrary.tsx    # Object browser/search UI
│   │   ├── Toolbar.tsx     # Main toolbar controls
│   │   ├── PropertiesPanel.tsx  # Object properties editor
│   │   └── ExportButton.tsx     # Screenshot export
│   ├── lib/
│   │   └── objectTemplates.ts   # 3D object definitions
│   ├── store/
│   │   └── workspaceStore.ts    # Zustand state management
│   ├── types/
│   │   └── workspace.ts    # TypeScript type definitions
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── public/                 # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Technology Stack

### Core Technologies

- **[Next.js 16](https://nextjs.org/)**: React framework with App Router and Server Components
- **[React 19](https://react.dev/)**: Latest React with improved hooks
- **[TypeScript](https://www.typescriptlang.org/)**: Full type safety across the application
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Utility-first styling with custom glassmorphism

### 3D Graphics

- **[Three.js](https://threejs.org/)**: WebGL-based 3D graphics library
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)**: React reconciler for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei)**: Transform controls, orbit controls, environment, and grid helpers

### State Management & Utilities

- **[Zustand](https://github.com/pmndrs/zustand)**: Minimal state management with persist middleware
- **[UUID](https://github.com/uuidjs/uuid)**: Unique ID generation for objects
- **[Lucide React](https://lucide.dev/)**: Beautiful icon library with 1000+ icons
- **[html2canvas](https://html2canvas.hertzen.com/)**: Client-side screenshot capture

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "16.0.7",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "three": "^0.x.x",
    "@react-three/fiber": "^8.x.x",
    "@react-three/drei": "^9.x.x",
    "zustand": "^4.x.x",
    "lucide-react": "^0.x.x",
    "html2canvas": "^1.x.x"
  }
}
```

## 🎨 Customization

### Adding New Objects

Edit `app/lib/objectTemplates.ts` to add new object templates:

```typescript
{
  id: 'unique-id',
  name: 'Object Name',
  category: 'Category',
  description: 'Object description',
  geometry: 'box', // 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'
  defaultScale: [width, height, depth],
  defaultColor: '#hexcolor',
  tags: ['tag1', 'tag2'],
}
```

### Modifying Scene

Edit `app/components/Scene.tsx` to adjust:
- Camera position and settings
- Lighting setup
- Grid configuration
- Background color

### Styling

- Global styles: `app/globals.css`
- Component styles: Inline Tailwind classes
- Theme colors: Modify Tailwind config if needed

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Building for Production

```bash
npm run build
npm run start
```

The application will be optimized and ready for deployment.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy with one click

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted with Node.js

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

- Add new 3D object templates
- Improve the UI/UX
- Add new features (e.g., custom textures, lighting presets)
- Fix bugs
- Improve documentation

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for the amazing 3D library
- [Poimandres](https://github.com/pmndrs) for React Three Fiber and Drei
- [Vercel](https://vercel.com) for Next.js
- [Lucide](https://lucide.dev/) for beautiful icons

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Three.js**
