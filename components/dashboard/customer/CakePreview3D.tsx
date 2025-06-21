/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { X, ZoomIn, ZoomOut, ShoppingCart, Move, RotateCw } from "lucide-react";

interface CakeConfig {
  shape?: "round" | "square"; // Add shape support
  flavor: string;
  layers: number;
  frostingColor: string;
  toppings: string[];
  price?: number; // Optional price for AI suggestions
  selectedCake?: {
    name: string;
    price: number;
    description: string;
  };
}

interface CakePreview3DProps {
  isOpen: boolean;
  onClose: () => void;
  cakeConfig: CakeConfig;
  onAddToCart: (cake: unknown) => void;
}

const CakePreview3D: React.FC<CakePreview3DProps> = ({
  isOpen,
  onClose,
  cakeConfig,
  onAddToCart,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cakeGroupRef = useRef<THREE.Group | null>(null);

  // Enhanced control states
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [controlMode, setControlMode] = useState<"rotate" | "pan">("rotate");
  const [, setIsDragging] = useState(false);
  const [] = useState({ x: 0, y: 0 });
  const [cameraPosition] = useState({ x: 0, y: 5, z: 8 });
  const [targetPosition] = useState({ x: 0, y: 0, z: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Mouse interaction refs
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rotationRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0, z: 0 });

  // Color mapping for frosting colors
  const colorMap: { [key: string]: number } = {
    "bg-pink-400": 0xff69b4,
    "bg-blue-400": 0x4169e1,
    "bg-green-400": 0x32cd32,
    "bg-yellow-400": 0xffd700,
    "bg-purple-400": 0x9370db,
    "bg-white": 0xffffff,
    "bg-orange-900": 0x8b4513, // brown
  };
  useEffect(() => {
    console.log("CakeConfig received:", cakeConfig);
  }, [cakeConfig]);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    sceneRef.current = scene;

    // Responsive container size
    const containerWidth = mountRef.current.offsetWidth || 500;
    const containerHeight = 400;

    // Camera setup with better initial position
    const camera = new THREE.PerspectiveCamera(
      45,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
    cameraRef.current = camera;

    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(10, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Add environment
    addEnvironment(scene);

    // Create enhanced cake
    createEnhancedCake(scene);

    // Mouse event handlers for interactive controls
    const canvas = renderer.domElement;

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      setIsAutoRotating(false);

      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const currentMouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const deltaX = currentMouse.x - mousePositionRef.current.x;
      const deltaY = currentMouse.y - mousePositionRef.current.y;

      if (controlMode === "rotate") {
        rotationRef.current.y += deltaX * 0.01;
        rotationRef.current.x += deltaY * 0.01;

        // Limit vertical rotation
        rotationRef.current.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, rotationRef.current.x)
        );

        updateCameraPosition();
      } else if (controlMode === "pan") {
        panRef.current.x -= deltaX * 0.01;
        panRef.current.y += deltaY * 0.01;
        updateCameraTarget();
      }

      mousePositionRef.current = currentMouse;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 1.1 : 0.9;
      setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev * delta)));
    };

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Update camera position based on controls
    const updateCameraPosition = () => {
      if (!cameraRef.current) return;

      const radius = 8 * zoomLevel;
      const x =
        radius *
        Math.cos(rotationRef.current.x) *
        Math.sin(rotationRef.current.y);
      const y = radius * Math.sin(rotationRef.current.x) + 2;
      const z =
        radius *
        Math.cos(rotationRef.current.x) *
        Math.cos(rotationRef.current.y);

      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(
        panRef.current.x,
        panRef.current.y,
        panRef.current.z
      );
    };

    const updateCameraTarget = () => {
      if (!cameraRef.current) return;
      cameraRef.current.lookAt(
        panRef.current.x,
        panRef.current.y,
        panRef.current.z
      );
    };

    // Animation loop with enhanced controls
    const animate = () => {
      requestAnimationFrame(animate);

      if (isAutoRotating && !isDraggingRef.current && cakeGroupRef.current) {
        cakeGroupRef.current.rotation.y += 0.005;
      }

      // Smooth zoom transition
      if (cameraRef.current) {
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current)
        return;

      const containerWidth = mountRef.current.offsetWidth || 500;
      const containerHeight = 400;

      cameraRef.current.aspect = containerWidth / containerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerWidth, containerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, cakeConfig, isAutoRotating, controlMode, zoomLevel]);

  const addEnvironment = (scene: THREE.Scene) => {
    // Add a subtle ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add some ambient particles for atmosphere
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.3,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
  };

  const createEnhancedCake = (scene: THREE.Scene) => {
    const cakeGroup = new THREE.Group();
    cakeGroupRef.current = cakeGroup;

    const layerHeight = 1.2;
    const baseRadius = 2.5;
    const frostingColor = colorMap[cakeConfig.frostingColor] || 0xffffff;
    const isSquare = cakeConfig.shape === "square";

    // Create cake layers with enhanced details
    for (let i = 0; i < cakeConfig.layers; i++) {
      const radius = baseRadius - i * 0.4;
      const yPosition = i * layerHeight;

      // Main cake layer with better geometry
      let cakeGeometry;
      if (isSquare) {
        const size = radius * 2;
        cakeGeometry = new THREE.BoxGeometry(size, layerHeight * 0.8, size);
      } else {
        cakeGeometry = new THREE.CylinderGeometry(
          radius,
          radius,
          layerHeight * 0.8,
          64,
          4
        );
      }

      const cakeMaterial = new THREE.MeshPhysicalMaterial({
        color: getCakeColor(cakeConfig.flavor),
        roughness: 0.5,
        metalness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        sheen: 0.5,
        sheenColor: new THREE.Color(0xffffff),
      });

      const cakeLayer = new THREE.Mesh(cakeGeometry, cakeMaterial);
      cakeLayer.position.y = yPosition;
      cakeLayer.castShadow = true;
      cakeLayer.receiveShadow = true;
      cakeGroup.add(cakeLayer);

      // Enhanced frosting layer with texture
      let frostingGeometry;
      if (isSquare) {
        const size = (radius + 0.05) * 2;
        frostingGeometry = new THREE.BoxGeometry(
          size,
          layerHeight * 0.85,
          size
        );
      } else {
        frostingGeometry = new THREE.CylinderGeometry(
          radius + 0.05,
          radius + 0.05,
          layerHeight * 0.85,
          64,
          4
        );
      }

      const frostingMaterial = new THREE.MeshPhysicalMaterial({
        color: frostingColor,
        roughness: 0.3,
        metalness: 0.0,
        transmission: 0.7,
        thickness: 0.5,
        ior: 1.3,
        transparent: true,
        opacity: 0.95,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        sheen: 0.7,
        sheenColor: new THREE.Color(frostingColor),
      });

      const frostingLayer = new THREE.Mesh(frostingGeometry, frostingMaterial);
      frostingLayer.position.y = yPosition;
      frostingLayer.castShadow = true;
      frostingLayer.receiveShadow = true;
      cakeGroup.add(frostingLayer);

      // Add frosting details (piped edges)
      if (!isSquare) {
        addFrostingDetails(
          cakeGroup,
          radius,
          yPosition + layerHeight * 0.4,
          frostingColor
        );
      }
    }

    // Add enhanced toppings
    addEnhancedToppings(cakeGroup);

    // Add candles if it's a birthday cake
    if (
      cakeConfig.flavor.toLowerCase().includes("birthday") ||
      cakeConfig.toppings.length > 0
    ) {
      addCandles(cakeGroup);
    }

    scene.add(cakeGroup);
  };

  const addFrostingDetails = (
    cakeGroup: THREE.Group,
    radius: number,
    yPos: number,
    color: number
  ) => {
    const detailCount = 32;
    for (let i = 0; i < detailCount; i++) {
      const angle = (i / detailCount) * Math.PI * 2;
      const x = Math.cos(angle) * (radius + 0.1);
      const z = Math.sin(angle) * (radius + 0.1);

      const detailGeometry = new THREE.SphereGeometry(0.04, 8, 6);
      const detailMaterial = new THREE.MeshPhongMaterial({ color: color });
      const detail = new THREE.Mesh(detailGeometry, detailMaterial);
      detail.position.set(x, yPos, z);
      detail.castShadow = true;
      cakeGroup.add(detail);
    }
  };

  const addCandles = (cakeGroup: THREE.Group) => {
    const topY = (cakeConfig.layers - 1) * 1.2 + 0.6;
    const candleCount = Math.min(cakeConfig.layers + 2, 5);

    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2;
      const radius = 1.5 - (cakeConfig.layers - 1) * 0.3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Candle stick
      const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
      const candleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const candle = new THREE.Mesh(candleGeometry, candleMaterial);
      candle.position.set(x, topY + 0.4, z);
      candle.castShadow = true;
      cakeGroup.add(candle);

      // Flame
      const flameGeometry = new THREE.SphereGeometry(0.08, 8, 6);
      const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.8,
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(x, topY + 0.9, z);
      flame.scale.y = 1.5;
      cakeGroup.add(flame);
    }
  };

  const getCakeColor = (flavor: string): number => {
    // Robust flavor color mapping (case-insensitive)
    const flavorColors: { [key: string]: number } = {
      chocolate: 0x8b4513,
      vanilla: 0xfff8dc,
      strawberry: 0xffb6c1,
      "red velvet": 0xdc143c,
      lemon: 0xfffacd,
    };
    return flavorColors[flavor.toLowerCase()] || 0xfff8dc;
  };

  const addEnhancedToppings = (cakeGroup: THREE.Group) => {
    const topY = (cakeConfig.layers - 1) * 1.2 + 0.5;
    const topRadius = 2.5 - (cakeConfig.layers - 1) * 0.4;

    cakeConfig.toppings.forEach((topping) => {
      const toppingCount = topping === "Sprinkles" ? 20 : 8;

      for (let i = 0; i < toppingCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * topRadius * 0.8;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        let toppingMesh: THREE.Mesh;

        switch (topping) {
          case "Fresh Berries":
            const berryGeometry = new THREE.SphereGeometry(0.12, 12, 8);
            const berryMaterial = new THREE.MeshPhongMaterial({
              color: Math.random() > 0.5 ? 0xff0000 : 0x0000ff,
              shininess: 50,
            });
            toppingMesh = new THREE.Mesh(berryGeometry, berryMaterial);
            break;

          case "Chocolate Chips":
            const chipGeometry = new THREE.TetrahedronGeometry(0.08);
            const chipMaterial = new THREE.MeshPhongMaterial({
              color: 0x654321,
              shininess: 20,
            });
            toppingMesh = new THREE.Mesh(chipGeometry, chipMaterial);
            break;

          case "Sprinkles":
            const sprinkleGeometry = new THREE.CylinderGeometry(
              0.02,
              0.02,
              0.2,
              6
            );
            const sprinkleMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
            });
            toppingMesh = new THREE.Mesh(sprinkleGeometry, sprinkleMaterial);
            toppingMesh.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            );
            break;

          default:
            const defaultGeometry = new THREE.SphereGeometry(0.1, 8, 6);
            const defaultMaterial = new THREE.MeshPhongMaterial({
              color: 0xffd700,
              shininess: 30,
            });
            toppingMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
        }

        toppingMesh.position.set(x, topY, z);
        toppingMesh.castShadow = true;
        cakeGroup.add(toppingMesh);
      }
    });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(0.5, prev * 0.8));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(3, prev * 1.2));
  };

  const resetView = () => {
    setZoomLevel(1);
    setIsAutoRotating(true);
    rotationRef.current = { x: 0, y: 0 };
    panRef.current = { x: 0, y: 0, z: 0 };
  };

  // Capture a snapshot of the 3D canvas and add to cart
  const handleAddToCart = () => {
    let imageUri = undefined;
    if (rendererRef.current) {
      try {
        // Debug: check renderer and domElement
        console.log('[CakePreview3D] rendererRef.current:', rendererRef.current);
        console.log('[CakePreview3D] rendererRef.current.domElement:', rendererRef.current.domElement);
        // Force a render before snapshot
        if (sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        // Get the data URL of the current canvas
        imageUri = rendererRef.current.domElement.toDataURL("image/png");
        console.log("[CakePreview3D] Captured snapshot URI:", imageUri);
      } catch (err) {
        console.error("[CakePreview3D] Failed to capture snapshot:", err);
      }
    } else {
      console.warn("[CakePreview3D] Renderer not available for snapshot.");
    }
    const customCake = {
      id: Date.now(),
      name: `Custom ${cakeConfig.flavor} Cake`,
      flavor: cakeConfig.flavor,
      layers: cakeConfig.layers,
      frostingColor: cakeConfig.frostingColor,
      toppings: cakeConfig.toppings,
      price: calculatePrice(),
      imageUri, // Pass the snapshot URI for the cart
      isCustom: true,
    };
    console.log("[CakePreview3D] Adding custom cake to cart:", customCake);
    onAddToCart(customCake);
    onClose();
  };

  const calculatePrice = (): number => {
    // Use price from config if present (AI suggestion), else calculate
    if (typeof cakeConfig.price === 'number') {
      return cakeConfig.price;
    }
    let basePrice = 1000;
    basePrice += cakeConfig.layers * 300;
    basePrice += cakeConfig.toppings.length * 100;
    return basePrice;
  };

  if (!isOpen) return null;

  const getFrostingColorName = (colorClass: string): string => {
    const colorNames: { [key: string]: string } = {
      "bg-pink-400": "Pink",
      "bg-blue-400": "Blue",
      "bg-green-400": "Green",
      "bg-yellow-400": "Yellow",
      "bg-purple-400": "Purple",
      "bg-white": "White",
    };
    return colorNames[colorClass] || "White";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Enhanced 3D Cake Preview
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Enhanced 3D Preview */}
            <div className="space-y-4">
              <div
                ref={mountRef}
                className="border border-gray-200 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing w-full overflow-hidden"
                style={{ height: "400px", minWidth: "300px" }}
              />

              {/* Enhanced Controls */}
              <div className="space-y-3">
                {/* Control Mode Toggle */}
                <div className="flex items-center justify-center space-x-2 flex-wrap">
                  <button
                    onClick={() => setControlMode("rotate")}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center space-x-1 ${
                      controlMode === "rotate"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Rotate</span>
                  </button>
                  <button
                    onClick={() => setControlMode("pan")}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center space-x-1 ${
                      controlMode === "pan"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <Move className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Pan</span>
                  </button>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-center space-x-1 sm:space-x-2 flex-wrap gap-2">
                  <button
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                      isAutoRotating
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {isAutoRotating ? "Stop" : "Auto"}
                  </button>

                  <button
                    onClick={handleZoomIn}
                    className="px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={handleZoomOut}
                    className="px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={resetView}
                    className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                {/* Zoom Level Indicator */}
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    Zoom: {Math.round(zoomLevel * 100)}%
                  </span>
                </div>

                {/* Instructions */}
                <div className="text-xs text-gray-500 text-center space-y-1 bg-gray-50 p-3 rounded-lg">
                  <p>
                    <strong>Mouse:</strong> Click & drag to {controlMode}
                  </p>
                  <p>
                    <strong>Scroll:</strong> Zoom in/out
                  </p>
                  <p>
                    <strong>Controls:</strong> Use buttons above for different
                    modes
                  </p>
                </div>
              </div>
            </div>

            {/* Cake Details - Same as before */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Cake Configuration
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Flavor:</span>
                    <span className="font-medium text-gray-800">
                      {cakeConfig.flavor}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Layers:</span>
                    <span className="font-medium text-gray-800">
                      {cakeConfig.layers}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Frosting Color:</span>
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full mr-2 border border-gray-300 ${cakeConfig.frostingColor}`}
                      />
                      <span className="font-medium text-gray-800">
                        {getFrostingColorName(cakeConfig.frostingColor)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Toppings:</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-800">
                        {cakeConfig.toppings.length} selected
                      </span>
                      {cakeConfig.toppings.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {cakeConfig.toppings.map((topping, index) => (
                            <div key={index} className="text-xs text-gray-500">
                              • {topping}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {cakeConfig.toppings.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    Selected Toppings ({cakeConfig.toppings.length}):
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {cakeConfig.toppings.map((topping, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border"
                      >
                        {topping}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">
                  Cake Summary:
                </h5>
                <p className="text-sm text-gray-600">
                  A {cakeConfig.layers}-layer {cakeConfig.flavor.toLowerCase()}{" "}
                  cake with{" "}
                  {getFrostingColorName(cakeConfig.frostingColor).toLowerCase()}{" "}
                  frosting
                  {cakeConfig.toppings.length > 0 && (
                    <span>
                      , topped with{" "}
                      {cakeConfig.toppings.join(", ").toLowerCase()}
                    </span>
                  )}
                  .
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price:</span>
                    <span>₹1,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Layers ({cakeConfig.layers}):
                    </span>
                    <span>₹{cakeConfig.layers * 300}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Toppings ({cakeConfig.toppings.length}):
                    </span>
                    <span>₹{cakeConfig.toppings.length * 100}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Total Price:
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{calculatePrice()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add Custom Cake to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakePreview3D;
