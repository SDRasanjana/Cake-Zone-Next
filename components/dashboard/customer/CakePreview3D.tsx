/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import {
  X,
  ZoomIn,
  ZoomOut,
  ShoppingCart,
  Move,
  RotateCw,
  Loader,
} from "lucide-react";
import { CakeModelManager } from "@/lib/CakeModelManager";

interface CakeConfig {
  shape?: "round" | "square";
  flavor: string;
  layers: number;
  frostingColor: string;
  toppings: string[];
  price?: number;
  selectedCake?: {
    name: string;
    price: number;
    description: string;
  };
  [key: string]: any;
}

interface CakePreview3DProps {
  isOpen: boolean;
  onClose: () => void;
  cakeConfig: CakeConfig;
  onAddToCart: (cake: unknown) => void;
  price: number;
}

const CakePreview3D: React.FC<CakePreview3DProps> = ({
  isOpen,
  onClose,
  cakeConfig,
  onAddToCart,
  price,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cakeGroupRef = useRef<THREE.Group | null>(null);
  const modelManagerRef = useRef<CakeModelManager | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Enhanced control states
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [controlMode, setControlMode] = useState<"rotate" | "pan">("rotate");
  const [isLoading, setIsLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [minZoom] = useState(0.5);
  const [maxZoom] = useState(3);

  // Mouse interaction refs
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rotationRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0, z: 0 });

  // Initialize model manager
  useEffect(() => {
    if (!modelManagerRef.current) {
      console.log("🎮 Initializing CakeModelManager with FBX models...");
      modelManagerRef.current = new CakeModelManager();
      loadModels();
    }
  }, []);

  const loadModels = async () => {
    if (!modelManagerRef.current) return;

    try {
      setIsLoading(true);
      setModelError(null);

      console.log("🚀 Starting to load FBX cake models...");
      // Start loading models
      await modelManagerRef.current.loadAllModels();
      console.log("🎉 Model loading completed!");

      setIsLoading(false);

      // Create the cake once models are loaded
      if (isOpen) {
        console.log("📺 Dialog is open, creating cake...");
        createBlenderCake();
      } else {
        console.log("📴 Dialog is closed, waiting...");
      }
    } catch (error) {
      console.error("❌ Failed to load cake models:", error);
      setModelError("Failed to load 3D models. Using fallback rendering.");
      setIsLoading(false);

      // Fallback to procedural cake
      console.log("🔄 Creating fallback cake...");
      createFallbackCake();
    }
  };

  // Initialize 3D scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    initializeScene();

    if (!isLoading && modelManagerRef.current?.isLoaded()) {
      createBlenderCake();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, isLoading]);

  // Update cake when config changes
  useEffect(() => {
    if (!isLoading && isOpen && modelManagerRef.current?.isLoaded()) {
      createBlenderCake();
    }
  }, [cakeConfig, isLoading]);

  const initializeScene = () => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    sceneRef.current = scene;

    // Responsive container size
    const containerWidth = mountRef.current.offsetWidth || 500;
    const containerHeight = 600;

    // Camera setup with much better framing
    const camera = new THREE.PerspectiveCamera(
      50,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);
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
    setupLighting(scene);

    // Add environment
    addEnvironment(scene);

    // Mouse controls
    setupMouseControls(renderer.domElement);

    // Start animation loop
    animate();
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light
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
  };

  const addEnvironment = (scene: THREE.Scene) => {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
  };

  const createBlenderCake = () => {
    if (!sceneRef.current || !modelManagerRef.current) return;

    // Remove existing cake
    if (cakeGroupRef.current) {
      sceneRef.current.remove(cakeGroupRef.current);
    }

    try {
      // Debug: Check model manager state
      console.log("🔍 Model Manager Debug:", {
        isLoaded: modelManagerRef.current.isLoaded(),
        modelCount: modelManagerRef.current.getLoadedModelCount(),
      });

      // Force use of complete cake models
      console.log("🎯 Attempting to use complete cake models...");

      // Check if models are actually loaded
      if (!modelManagerRef.current?.isLoaded()) {
        console.warn("⚠️ Complete cake models not loaded, using fallback");
        console.warn("🔍 Model state:", {
          modelCount: modelManagerRef.current?.getLoadedModelCount() || 0,
          isLoaded: modelManagerRef.current?.isLoaded() || false,
        });
        setModelError(
          "Complete cake models failed to load - using procedural geometry"
        );
        createFallbackCake();
        return;
      }

      // Create cake assembly using complete Blender models
      console.log("🏗️ Creating complete cake assembly...");
      const cakeAssembly = modelManagerRef.current.createCakeAssembly({
        shape: cakeConfig.shape || "square",
        layers: cakeConfig.layers,
        flavor: cakeConfig.flavor || "vanilla",
        frostingColor: cakeConfig.frostingColor,
        toppings: cakeConfig.toppings,
      });

      // Check if assembly is empty (no models loaded)
      console.log(
        "🔍 Cake assembly children count:",
        cakeAssembly.children.length
      );
      if (cakeAssembly.children.length === 0) {
        console.warn("⚠️ Cake assembly is empty, using fallback");
        setModelError("Cake assembly failed - no models loaded");
        createFallbackCake();
        return;
      }

      // Note: Scale is already applied in CakeModelManager, no additional scaling needed

      cakeGroupRef.current = cakeAssembly;
      sceneRef.current.add(cakeAssembly);

      // Auto-fit the cake in the view
      fitCakeToView(cakeAssembly);

      console.log(
        `🎂 Created Blender cake: ${cakeConfig.shape} with ${cakeConfig.layers} layers, using model manager scaling`
      );
    } catch (error) {
      console.error("Error creating Blender cake:", error);
      createFallbackCake();
    }
  };

  const fitCakeToView = (cakeGroup: THREE.Group) => {
    if (!cameraRef.current) return;

    // Calculate bounding box of the cake
    const box = new THREE.Box3().setFromObject(cakeGroup);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log("🎂 Cake bounding box:", {
      size: {
        x: size.x.toFixed(2),
        y: size.y.toFixed(2),
        z: size.z.toFixed(2),
      },
      center: {
        x: center.x.toFixed(2),
        y: center.y.toFixed(2),
        z: center.z.toFixed(2),
      },
    });

    // Allow larger cakes for better visibility, only scale down if extremely large
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 10) {
      // Increased threshold from 5 to 10
      const additionalScale = 6 / maxDim; // Less aggressive scaling (6 instead of 3)
      cakeGroup.scale.multiplyScalar(additionalScale);
      console.log(`🔧 Applied minimal scaling: ${additionalScale.toFixed(3)}`);
    } else {
      console.log(
        `🎂 Cake size OK: ${maxDim.toFixed(2)} - no additional scaling needed`
      );
    }

    // Update the rotation reference to maintain proper framing
    rotationRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
  };

  const createFallbackCake = () => {
    if (!sceneRef.current) return;

    // Remove existing cake
    if (cakeGroupRef.current) {
      sceneRef.current.remove(cakeGroupRef.current);
    }

    // Create a simple fallback cake using basic geometry
    const cakeGroup = new THREE.Group();
    const layerHeight = 0.5; // Match the FBX version
    const baseRadius = 0.8; // Much smaller to fit better
    const isSquare = cakeConfig.shape === "square";

    // Color mapping for frosting colors
    const colorMap: { [key: string]: number } = {
      "bg-pink-400": 0xff69b4,
      "bg-blue-400": 0x4169e1,
      "bg-green-400": 0x32cd32,
      "bg-yellow-400": 0xffd700,
      "bg-purple-400": 0x9370db,
      "bg-white": 0xffffff,
      "bg-orange-900": 0x8b4513,
      "bg-cream-200": 0xfffdd0,
    };

    const frostingColor = colorMap[cakeConfig.frostingColor] || 0xffffff;

    for (let i = 0; i < cakeConfig.layers; i++) {
      const radius = baseRadius - i * 0.4;
      const yPosition = i * layerHeight;

      let cakeGeometry;
      if (isSquare) {
        const size = radius * 2;
        cakeGeometry = new THREE.BoxGeometry(size, layerHeight * 0.8, size);
      } else {
        cakeGeometry = new THREE.CylinderGeometry(
          radius,
          radius,
          layerHeight * 0.8,
          32
        );
      }

      const cakeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf4a460,
        roughness: 0.5,
        metalness: 0.1,
      });

      const cakeLayer = new THREE.Mesh(cakeGeometry, cakeMaterial);
      cakeLayer.position.y = yPosition;
      cakeLayer.castShadow = true;
      cakeLayer.receiveShadow = true;
      cakeGroup.add(cakeLayer);

      // Add frosting layer
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
          32
        );
      }

      const frostingMaterial = new THREE.MeshPhysicalMaterial({
        color: frostingColor,
        roughness: 0.3,
        metalness: 0.0,
        transparent: true,
        opacity: 0.95,
      });

      const frostingLayer = new THREE.Mesh(frostingGeometry, frostingMaterial);
      frostingLayer.position.y = yPosition;
      frostingLayer.castShadow = true;
      frostingLayer.receiveShadow = true;
      cakeGroup.add(frostingLayer);
    }

    // Add toppings
    const topY = (cakeConfig.layers - 1) * layerHeight + 0.3;
    const topRadius = baseRadius - (cakeConfig.layers - 1) * 0.2;

    cakeConfig.toppings.forEach((topping) => {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * topRadius * 0.8;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        let toppingGeometry;
        let toppingColor;

        switch (topping) {
          case "Fresh Berries":
            toppingGeometry = new THREE.SphereGeometry(0.12, 12, 8);
            toppingColor = Math.random() > 0.5 ? 0xff0000 : 0x0000ff;
            break;
          case "Chocolate Chips":
            toppingGeometry = new THREE.TetrahedronGeometry(0.08);
            toppingColor = 0x654321;
            break;
          case "Sprinkles":
            toppingGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6);
            toppingColor = new THREE.Color()
              .setHSL(Math.random(), 1, 0.5)
              .getHex();
            break;
          default:
            toppingGeometry = new THREE.SphereGeometry(0.1, 8, 6);
            toppingColor = 0xffd700;
        }

        const toppingMaterial = new THREE.MeshPhongMaterial({
          color: toppingColor,
        });
        const toppingMesh = new THREE.Mesh(toppingGeometry, toppingMaterial);
        toppingMesh.position.set(x, topY, z);
        toppingMesh.castShadow = true;
        cakeGroup.add(toppingMesh);
      }
    });

    cakeGroupRef.current = cakeGroup;
    sceneRef.current.add(cakeGroup);
  };

  const setupMouseControls = (canvas: HTMLElement) => {
    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
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
        rotationRef.current.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, rotationRef.current.x)
        );
        updateCameraPosition();
      }

      mousePositionRef.current = currentMouse;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * 0.001;
      setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev + delta)));
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  };

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;

    const radius = 8 * zoomLevel;
    const x =
      Math.sin(rotationRef.current.y) *
      Math.cos(rotationRef.current.x) *
      radius;
    const y = Math.sin(rotationRef.current.x) * radius + 2;
    const z =
      Math.cos(rotationRef.current.y) *
      Math.cos(rotationRef.current.x) *
      radius;

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0.5, 0);
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // Auto rotation
    if (isAutoRotating && cakeGroupRef.current) {
      cakeGroupRef.current.rotation.y += 0.005;
    }

    // Update camera based on zoom
    updateCameraPosition();

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    if (sceneRef.current) {
      sceneRef.current.clear();
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    console.log(
      `🔍 Zoom button clicked: ${direction}, current level: ${zoomLevel}`
    );
    const delta = direction === "in" ? 0.3 : -0.3; // Fixed: positive for zoom in, negative for zoom out
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
    console.log(`🔍 New zoom level: ${newZoom} (delta: ${delta})`);
    setZoomLevel(newZoom);

    // Actually move the camera based on zoom level
    if (cameraRef.current) {
      const baseDistance = 8;
      const newDistance = baseDistance / newZoom; // Higher zoom = closer = smaller distance

      // Maintain the current direction but change distance
      const currentPos = cameraRef.current.position;
      const cameraDirection = currentPos.clone().normalize();
      cameraRef.current.position.copy(
        cameraDirection.multiplyScalar(newDistance)
      );
      cameraRef.current.lookAt(0, 1, 0);

      console.log(
        `🔍 Zoom ${direction === "in" ? "In" : "Out"}: level ${newZoom.toFixed(
          1
        )}, distance ${newDistance.toFixed(1)}`
      );
    }
  };

  const resetView = () => {
    setZoomLevel(0.8); // Start with slightly zoomed out view
    setIsAutoRotating(true);
    rotationRef.current = { x: 0, y: 0 };
    panRef.current = { x: 0, y: 0, z: 0 };

    // If we have a cake, try to fit it again
    if (cakeGroupRef.current) {
      fitCakeToView(cakeGroupRef.current);
    }
  };

  const handleAddToCart = () => {
    let imageUri = undefined;
    if (rendererRef.current) {
      try {
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
    }

    const cartItem = {
      id: Date.now(),
      name: cakeConfig.selectedCake?.name || "Custom Cake",
      price: price,
      quantity: 1,
      config: cakeConfig,
      description: `${cakeConfig.shape} cake with ${cakeConfig.layers} layers`,
      imageUri,
      isCustom: true,
    };
    onAddToCart(cartItem);
    onClose();
  };

  const getFrostingColorName = (colorClass: string): string => {
    const colorNames: { [key: string]: string } = {
      "bg-pink-400": "Pink",
      "bg-blue-400": "Blue",
      "bg-green-400": "Green",
      "bg-yellow-400": "Yellow",
      "bg-purple-400": "Purple",
      "bg-white": "White",
      "bg-orange-900": "Chocolate",
      "bg-cream-200": "Cream",
    };
    return colorNames[colorClass] || "White";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <h2 className="text-xl font-bold text-gray-800">3D Cake Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors z-30 bg-white shadow-sm border"
            title="Close Preview"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row">
          {/* 3D Viewer */}
          <div className="flex-1 relative">
            <div
              ref={mountRef}
              className="w-full h-[600px] bg-gray-50 relative overflow-hidden"
            >
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10">
                  <Loader className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                  <p className="text-gray-600">Loading 3D models...</p>
                </div>
              )}

              {/* Error Overlay */}
              {modelError && (
                <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded z-10">
                  <p className="text-sm">{modelError}</p>
                </div>
              )}
            </div>

            {/* Controls */}
            {!isLoading && (
              <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                <button
                  onClick={() => handleZoom("in")}
                  className="p-3 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-all hover:scale-105 border-2 border-gray-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => handleZoom("out")}
                  className="p-3 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-all hover:scale-105 border-2 border-gray-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`p-3 rounded-full shadow-xl transition-all hover:scale-105 border-2 ${
                    isAutoRotating
                      ? "bg-orange-500 text-white border-orange-400"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                  title="Toggle Auto Rotation"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setControlMode(controlMode === "rotate" ? "pan" : "rotate")
                  }
                  className="p-3 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-all hover:scale-105 border-2 border-gray-200"
                  title={`Mode: ${controlMode}`}
                >
                  <Move className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={resetView}
                  className="p-3 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-all hover:scale-105 border-2 border-gray-200"
                  title="Reset View"
                >
                  <RotateCw className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-80 p-6 border-l bg-gray-50">
            <div className="space-y-3 mb-6 text-black">
              <div>
                <span className="font-semibold text-black">Shape:</span>{" "}
                <span className="text-black">
                  {cakeConfig.shape || "round"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-black">Flavor:</span>{" "}
                <span className="text-black capitalize">
                  {cakeConfig.flavor || "vanilla"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-black">Layers:</span>{" "}
                <span className="text-black">{cakeConfig.layers}</span>
              </div>
              <div>
                <span className="font-semibold text-black">Frosting:</span>
                <div
                  className={`inline-block w-4 h-4 rounded ml-2 ${cakeConfig.frostingColor}`}
                />
                <span className="ml-2 text-black">
                  {getFrostingColorName(cakeConfig.frostingColor)}
                </span>
              </div>
              {cakeConfig.toppings.length > 0 && (
                <div>
                  <span className="font-medium">Toppings:</span>
                  <ul className="list-disc list-inside mt-1">
                    {cakeConfig.toppings.map((topping, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {topping}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total Price:</span>
                <span className="text-xl font-bold text-orange-600">
                  Rs. {price}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-all hover:scale-105 disabled:bg-gray-400 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg font-semibold text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-sm text-gray-500">
              <p className="font-medium mb-2">Controls:</p>
              <ul className="space-y-1">
                <li>• Drag to rotate</li>
                <li>• Scroll to zoom</li>
                <li>• Use buttons for quick actions</li>
                {modelError && (
                  <li className="text-yellow-600 mt-2">
                    • Using basic fallback rendering
                  </li>
                )}
              </ul>
              {!modelError && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Using Blender models for realistic rendering
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakePreview3D;
