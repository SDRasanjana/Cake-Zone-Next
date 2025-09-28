import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export interface CakeModelParts {
  completeCakes: {
    round: {
      1: THREE.Group | null;
      2: THREE.Group | null;
      3: THREE.Group | null;
    };
    square: {
      1: THREE.Group | null;
      2: THREE.Group | null;
      3: THREE.Group | null;
    };
  };
}

export class CakeModelManager {
  private loader: FBXLoader;
  private models: CakeModelParts;
  private loadedModels: Map<string, THREE.Group> = new Map();

  constructor() {
    this.loader = new FBXLoader();
    
    this.models = {
      completeCakes: {
        round: { 1: null, 2: null, 3: null },
        square: { 1: null, 2: null, 3: null },
      },
    };
    
    console.log('🔧 CakeModelManager initialized for complete cake models');
  }

  async loadAllModels(): Promise<void> {
    console.log('🎂 Starting to load complete FBX cake models...');
    console.log('📁 Looking for models in: /models/cakes/toppings/');
    
    try {
      // Load complete cake models
      await this.loadCompleteCakes();
      
      // Debug: Check what was actually loaded
      console.log('🔍 Final model state:', {
        completeCakes: {
          round: {
            '1-layer': this.models.completeCakes.round[1] !== null,
            '2-layer': this.models.completeCakes.round[2] !== null,
            '3-layer': this.models.completeCakes.round[3] !== null,
          },
          square: {
            '1-layer': this.models.completeCakes.square[1] !== null,
            '2-layer': this.models.completeCakes.square[2] !== null,
            '3-layer': this.models.completeCakes.square[3] !== null,
          }
        },
        totalModels: this.loadedModels.size,
        loadedModelPaths: Array.from(this.loadedModels.keys())
      });
      
      if (this.loadedModels.size === 0) {
        console.error('❌ No models were loaded successfully!');
        throw new Error('No FBX models could be loaded');
      }
      
      console.log('✅ All complete FBX cake models loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load some cake models:', error);
      throw error;
    }
  }

  private async loadCompleteCakes(): Promise<void> {
    console.log('Loading complete cake models...');
    
    // Load all layer variations for both shapes
    const cakeModels = [
      { shape: 'square' as const, layers: 1, path: '/models/cakes/toppings/1LayerSquareCake.fbx' },
      { shape: 'square' as const, layers: 2, path: '/models/cakes/toppings/2LayerSquareCake.fbx' },
      { shape: 'square' as const, layers: 3, path: '/models/cakes/toppings/3LayerSquareCake.fbx' },
      { shape: 'round' as const, layers: 1, path: '/models/cakes/toppings/1LayerRoundCake.fbx' },
      { shape: 'round' as const, layers: 2, path: '/models/cakes/toppings/2LayerRoundCake.fbx' },
      { shape: 'round' as const, layers: 3, path: '/models/cakes/toppings/3LayerRoundCake.fbx' },
    ];

    for (const cake of cakeModels) {
      try {
        console.log(`🔽 Loading ${cake.layers}-layer ${cake.shape} cake from: ${cake.path}`);
        const model = await this.loadFBXModel(cake.path);
        this.models.completeCakes[cake.shape][cake.layers as 1 | 2 | 3] = model;
        console.log(`✅ Successfully loaded ${cake.layers}-layer ${cake.shape} cake model`);
      } catch (error) {
        console.error(`❌ Failed to load ${cake.layers}-layer ${cake.shape} cake from ${cake.path}:`, error);
      }
    }
  }

  private async loadFBXModel(path: string): Promise<THREE.Group> {
    // Check cache first
    if (this.loadedModels.has(path)) {
      console.log(`🔄 Using cached model: ${path}`);
      return this.loadedModels.get(path)!.clone();
    }

    console.log(`🔽 Loading complete cake model: ${path}`);
    console.log(`🌐 Full URL will be: ${window.location.origin}${path}`);
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        // Success callback
        (fbx) => {
          console.log(`✅ Successfully loaded complete cake: ${path}`);
          console.log(`🔍 FBX Details:`, {
            type: fbx.type,
            children: fbx.children.length,
            childrenTypes: fbx.children.map(child => child.type),
            hasGeometry: fbx.children.some(child => (child as any).geometry),
            hasMaterial: fbx.children.some(child => (child as any).material)
          });
          
          // Store in cache
          this.loadedModels.set(path, fbx);

          // Debug: Check the size of the loaded model
          const box = new THREE.Box3().setFromObject(fbx);
          const size = box.getSize(new THREE.Vector3());
          const isEmpty = size.x === 0 && size.y === 0 && size.z === 0;
          
          console.log(`📏 Complete cake dimensions for ${path}:`, {
            x: size.x.toFixed(2),
            y: size.y.toFixed(2), 
            z: size.z.toFixed(2),
            children: fbx.children.length,
            isEmpty: isEmpty
          });

          // Reject empty models
          if (isEmpty || fbx.children.length === 0) {
            console.error(`❌ Model ${path} is empty or has no geometry!`);
            reject(new Error(`Model ${path} loaded but contains no geometry`));
            return;
          }

          // Setup materials and shadows with enhanced transparency fixing
          let meshCount = 0;
          fbx.traverse((child: any) => {
            if (child.isMesh) {
              meshCount++;
              child.castShadow = true;
              child.receiveShadow = true;
              child.frustumCulled = false; // Prevent culling issues
              
              // Enhanced material fixing
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach((mat: any) => {
                  // Comprehensive transparency fix
                  mat.transparent = false;
                  mat.opacity = 1.0;
                  mat.alphaTest = 0;
                  mat.side = THREE.DoubleSide; // Ensure both sides render
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  
                  // Fix common transparency texture issues
                  if (mat.map) {
                    mat.map.flipY = false; // FBX standard
                  }
                  
                  mat.needsUpdate = true;
                });
              }
            }
          });
          
          console.log(`🔺 Found ${meshCount} meshes in complete cake`);
          resolve(fbx.clone());
        },
        // Progress callback
        (progress: any) => {
          if (progress && progress.total > 0) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`📥 Loading ${path}: ${percent}% (${progress.loaded}/${progress.total} bytes)`);
          }
        },
        // Error callback
        (error: any) => {
          console.error(`❌ Failed to load complete cake model: ${path}`, error);
          reject(error);
        }
      );
    });
  }

  createCakeAssembly(config: {
    shape: 'round' | 'square';
    layers: number;
    flavor: string;
    frostingColor: string;
    toppings: string[];
  }): THREE.Group {
    const cakeGroup = new THREE.Group();
    const overallScale = 0.4; // Much larger base scale for prominent 3D previews

    console.log(`🎂 Creating complete ${config.shape} cake with ${config.layers} layers, flavor: ${config.flavor}`);

    // Get the complete cake model for the specific layer count
    const completeCake = this.getCompleteCake(config.shape, config.layers);
    if (completeCake) {
      // Apply very large scaling for prominent visibility in preview images  
      const cakeScale = overallScale * 4; // Make cake 4x larger for excellent preview visibility
      completeCake.scale.setScalar(cakeScale);
      completeCake.position.y = 0; // Models are now properly edited, no offset needed
      
      // Fix transparency issues, especially for round cakes
      this.fixModelTransparency(completeCake, config.shape);
      
      // Debug: Show model structure to help with color application
      this.debugModelStructure(completeCake, config.shape, config.layers);
      
      // Apply colors: flavor color to layers, frosting color to frosting only
      this.applyFlavorAndFrostingColors(completeCake, config.flavor, config.frostingColor);
      
      cakeGroup.add(completeCake);
      console.log(`✅ Added complete ${config.layers}-layer ${config.shape} cake model`);
      
      // Add procedural toppings on top of the complete cake
      this.addProceduralToppings(cakeGroup, config, cakeScale);
    } else {
      console.warn(`⚠️ No complete ${config.layers}-layer ${config.shape} cake model available`);
      // Return empty group - will trigger fallback
      return cakeGroup;
    }

    return cakeGroup;
  }

  private addProceduralToppings(cakeGroup: THREE.Group, config: {
    shape: 'round' | 'square';
    layers: number;
    toppings: string[];
  }, scale: number): void {
    // Calculate the actual top position of the cake based on its bounding box
    const box = new THREE.Box3().setFromObject(cakeGroup);
    const cakeHeight = box.max.y - box.min.y;
    const topY = box.max.y + 0.1; // Place toppings well above the top surface
    const topRadius = Math.min(box.max.x - box.min.x, box.max.z - box.min.z) * 0.3; // Use actual cake dimensions
    
    console.log(`🍓 TOPPING DEBUG:`);
    console.log(`   Cake bounding box: min(${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)}) max(${box.max.x.toFixed(3)}, ${box.max.y.toFixed(3)}, ${box.max.z.toFixed(3)})`);
    console.log(`   Cake height: ${cakeHeight.toFixed(3)}, Topping Y: ${topY.toFixed(3)}, Radius: ${topRadius.toFixed(3)}`);

    config.toppings.forEach((topping) => {
      for (let i = 0; i < 50; i++) { // More toppings for better coverage
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * topRadius * 0.8;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        let toppingMesh: THREE.Mesh;
        
        switch (topping) {
          case "Fresh Berries":
            const berryGeometry = new THREE.SphereGeometry(0.3 * scale, 12, 8); // Extra large berries
            const berryMaterial = new THREE.MeshPhongMaterial({
              color: Math.random() > 0.5 ? 0xff0000 : 0x0000ff,
              shininess: 50,
            });
            toppingMesh = new THREE.Mesh(berryGeometry, berryMaterial);
            break;
            
          case "Chocolate Chips":
            const chipGeometry = new THREE.TetrahedronGeometry(0.15 * scale); // Extra large chips
            const chipMaterial = new THREE.MeshPhongMaterial({
              color: 0x654321,
              shininess: 20,
            });
            toppingMesh = new THREE.Mesh(chipGeometry, chipMaterial);
            break;
            
          case "Sprinkles":
            const sprinkleGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.15 * scale, 6); // Extra large sprinkles
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
            const defaultGeometry = new THREE.SphereGeometry(0.25 * scale, 8, 6); // Extra large default toppings
            const defaultMaterial = new THREE.MeshPhongMaterial({
              color: 0xffd700,
              shininess: 30,
            });
            toppingMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
        }
        
        toppingMesh.position.set(x, topY, z);
        toppingMesh.castShadow = true;
        cakeGroup.add(toppingMesh);
        
        // Debug first few toppings
        if (i < 3) {
          console.log(`   Topping ${i}: ${topping} at (${x.toFixed(3)}, ${topY.toFixed(3)}, ${z.toFixed(3)})`);
        }
      }
    });
  }

  private applyFlavorAndFrostingColors(mesh: THREE.Group, flavor: string, frostingColorClass: string): void {
    console.log('🎂 CAKE COLOR APPLICATION STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  📋 Cake Structure (top to bottom):`);
    console.log(`    1. FROSTING (top) - User selected color: ${frostingColorClass}`);
    console.log(`    2. LAYERS (middle) - Flavor color: ${flavor}`);
    console.log(`    3. BASE (bottom) - Always GREY`);

    // Flavor color mapping (for layers)
    const flavorColors: { [key: string]: number } = {
      "strawberry": 0xffb3ba, // Light pink for strawberry
      "chocolate": 0x8b4513,  // Brown for chocolate  
      "vanilla": 0xfff8dc,    // Cream for vanilla
    };

    // Frosting color mapping (for top component)
    const frostingColorMap: { [key: string]: number } = {
      "bg-pink-400": 0xff69b4,
      "bg-blue-400": 0x4169e1,
      "bg-green-400": 0x32cd32,
      "bg-yellow-400": 0xffd700,
      "bg-purple-400": 0x9370db,
      "bg-white": 0xffffff,
      "bg-orange-900": 0x8b4513,
      "bg-cream-200": 0xfffdd0,
    };

    const flavorColor = flavorColors[flavor.toLowerCase()] || 0xfff8dc; // Default to vanilla
    const frostingColor = frostingColorMap[frostingColorClass] || 0xffffff;
    const baseColor = 0x808080; // Always grey for base

    console.log(`  🎨 Color Values:`);
    console.log(`    • LAYERS (flavor): #${flavorColor.toString(16).padStart(6, '0')}`);
    console.log(`    • FROSTING (top): #${frostingColor.toString(16).padStart(6, '0')}`);
    console.log(`    • BASE (bottom): #${baseColor.toString(16).padStart(6, '0')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Strategy: Apply colors using both name-based and position-based logic
    this.applyColorsByStrategy(mesh, flavorColor, frostingColor, baseColor);
    
    console.log('✅ CAKE COLOR APPLICATION COMPLETED');
  }

  private applyColorsByStrategy(mesh: THREE.Group, flavorColor: number, frostingColor: number, baseColor: number): void {
    console.log('🎯 TESTING: Using ONLY position-based coloring to debug');
    
    // Only use position-based coloring for now to debug
    this.applyColorsByPosition(mesh, flavorColor, frostingColor, baseColor);
    
    // Disable name-based for now
    // this.applyColorsByName(mesh, flavorColor, frostingColor, baseColor);
  }

  private applyColorsByName(mesh: THREE.Group, flavorColor: number, frostingColor: number, baseColor: number): void {
    let totalMeshes = 0;
    let coloredMeshes = 0;
    
    mesh.traverse((child: any) => {
      if (child.isMesh && child.material) {
        totalMeshes++;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((mat: any, matIndex: number) => {
          if (mat.color) {
            const name = child.name ? child.name.toLowerCase() : '';
            let appliedColor = flavorColor; // Default to flavor color
            let colorType = 'flavor';
            
            // CORRECT NAME-BASED MAPPING:
            // BASE parts (bottom, larger component - ALWAYS GREY)
            if (name.includes('base') || name.includes('bottom') || name.includes('foundation') ||
                name.includes('plate') || name.includes('stand') || name.includes('floor')) {
              appliedColor = baseColor;  // GREY
              colorType = 'base';
            }
            // FROSTING parts (topmost component - USER SELECTED FROSTING COLOR)
            else if (name.includes('frosting') || name.includes('icing') || name.includes('cream') || 
                     name.includes('topping') || name.includes('decoration') || name.includes('glaze') ||
                     name.includes('top') || name.includes('surface') || name.includes('cover')) {
              appliedColor = frostingColor;  // USER SELECTED FROSTING COLOR
              colorType = 'frosting';
            }
            // LAYER parts (middle components - FLAVOR COLOR)
            else if (name.includes('layer') || name.includes('cake') || name.includes('sponge') ||
                     name.includes('tier') || name.includes('level') || name.includes('body')) {
              appliedColor = flavorColor;  // FLAVOR COLOR
              colorType = 'layers';
            }
            // Default to FLAVOR COLOR for unnamed parts
            else {
              appliedColor = flavorColor;  // FLAVOR COLOR
              colorType = 'layers';
            }
            
            mat.color.setHex(appliedColor);
            coloredMeshes++;
            
            console.log(`  🎨 Applied ${colorType} color (${appliedColor.toString(16)}) to: ${child.name || 'unnamed'} (material ${matIndex})`);
          }
        });
      }
    });
    
    console.log(`📝 Name-based coloring: ${coloredMeshes} materials colored across ${totalMeshes} meshes`);
  }

  private applyColorsByPosition(mesh: THREE.Group, flavorColor: number, frostingColor: number, baseColor: number): void {
    // Get all meshes and sort by Y position
    const meshes: { mesh: any, y: number, name: string }[] = [];
    
    mesh.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Calculate world position
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        meshes.push({ 
          mesh: child, 
          y: worldPos.y, 
          name: child.name || 'unnamed' 
        });
      }
    });
    
    // Sort by Y position (bottom to top)
    meshes.sort((a, b) => a.y - b.y);
    
    console.log(`🔍 DEBUG: Mesh Y positions:`)
    meshes.forEach((item, index) => {
      console.log(`  ${index}: "${item.name}" Y=${item.y.toFixed(3)}`);
    });
    
    console.log(`📍 Position-based coloring strategy for ${meshes.length} meshes:`);
    console.log(`🏗️  CAKE STRUCTURE (bottom to top):`);
    meshes.forEach((item, index) => {
      const percentage = ((index / meshes.length) * 100).toFixed(1);
      let expectedType = 'layers';
      if (index < meshes.length * 0.3) expectedType = 'BASE';
      else if (index >= meshes.length * 0.7) expectedType = 'FROSTING';
      console.log(`  ${index}: "${item.name}" at Y=${item.y.toFixed(3)} (${percentage}% from bottom) → ${expectedType}`);
    });
    
    // Apply colors based on position
    meshes.forEach((item, index) => {
      const materials = Array.isArray(item.mesh.material) ? item.mesh.material : [item.mesh.material];
      
      materials.forEach((mat: any) => {
        if (mat.color) {
          let appliedColor = flavorColor;
          let colorType = 'flavor';
          
          // MANUAL MAPPING based on observed mesh names:
          // Based on your feedback, let me try specific mesh assignments:
          
          // SPECIFIC ASSIGNMENTS for both round and square cakes:
          
          // SQUARE CAKE SPECIFIC meshes (SWAPPED assignments!)
          if (item.name === 'Cube012') {
            appliedColor = frostingColor;  // FROSTING COLOR (if this was getting grey, swap it)
            colorType = 'frosting';
            console.log(`  🔍 SQUARE ASSIGNMENT: Cube012 gets frosting color #${frostingColor.toString(16)}`);
          }
          else if (item.name === 'Cylinder001') {
            appliedColor = baseColor;  // GREY (if this was getting frosting color, swap it)
            colorType = 'base';
            console.log(`  🔍 SQUARE ASSIGNMENT: Cylinder001 gets grey #${baseColor.toString(16)}`);
          }
          else if (item.name.startsWith('Cube') && item.name !== 'Cube012') {
            appliedColor = flavorColor;  // FLAVOR COLOR (Cube013, Cube009, Cube014, Cube011)
            colorType = 'layers';
            console.log(`  🔍 SQUARE LAYERS DEBUG: ${item.name} gets flavor color #${flavorColor.toString(16)}`);
          }
          
          // ROUND CAKE meshes (Cylinder names)
          else if (item.name === 'Cylinder006') {
            appliedColor = frostingColor;  // FROSTING COLOR (topmost decorative part)
            colorType = 'frosting';
          }
          else if (item.name === 'Cylinder007') {
            appliedColor = baseColor;  // GREY (base - largest bottom part)
            colorType = 'base';
          }
          else if (item.name === 'Cylinder002' || item.name === 'Cylinder003' || 
                   item.name === 'Cylinder') {
            appliedColor = flavorColor;  // FLAVOR COLOR (middle layers, excluding Cylinder001 which is for square frosting)
            colorType = 'layers';
          }
          else if (item.name.startsWith('Cube') && item.name !== 'Cube012') {
            appliedColor = flavorColor;  // FLAVOR COLOR (Cube013, Cube009, Cube014, Cube011)
            colorType = 'layers';
          }
          
          // Fallback for unknown meshes
          else {
            appliedColor = flavorColor;  // FLAVOR COLOR (default to layers)
            colorType = 'layers';
          }
          
          mat.color.setHex(appliedColor);
          const percentage = ((index / meshes.length) * 100).toFixed(1);
          console.log(`  🎯 Applied ${colorType} color (#${appliedColor.toString(16)}) to "${item.name}" (position ${index}/${meshes.length} = ${percentage}% from bottom)`);
          
          // Extra debugging for issues
          if (item.name === 'Cylinder007' && colorType === 'base') {
            console.log(`  🔍 ROUND BASE DEBUG: Cylinder007 should be GREY (#808080), applied: #${appliedColor.toString(16)}`);
          }
          if (item.name === 'Cylinder001' && colorType === 'frosting') {
            console.log(`  🔍 SQUARE FROSTING DEBUG: Cylinder001 should get frosting (#${frostingColor.toString(16)}), applied: #${appliedColor.toString(16)}`);
          }
        }
      });
    });
  }

  private getCompleteCake(shape: 'round' | 'square', layers: number): THREE.Group | null {
    // Clamp layers to 1-3 range
    const layerCount = Math.max(1, Math.min(3, layers)) as 1 | 2 | 3;
    const model = this.models.completeCakes[shape][layerCount];
    return model?.clone() || null;
  }

  isLoaded(): boolean {
    const squareModels = [
      this.models.completeCakes.square[1] !== null,
      this.models.completeCakes.square[2] !== null,
      this.models.completeCakes.square[3] !== null,
    ];
    const roundModels = [
      this.models.completeCakes.round[1] !== null,
      this.models.completeCakes.round[2] !== null,
      this.models.completeCakes.round[3] !== null,
    ];
    
    const hasAnySquare = squareModels.some(Boolean);
    const hasAnyRound = roundModels.some(Boolean);
    const loaded = hasAnySquare || hasAnyRound; // At least one complete model
    
    console.log('🔍 Complete cake model loading status:', {
      squareModels: squareModels.map((loaded, i) => `${i+1}L: ${loaded}`),
      roundModels: roundModels.map((loaded, i) => `${i+1}L: ${loaded}`),
      hasAnySquare,
      hasAnyRound,
      totalModels: this.loadedModels.size,
      isLoaded: loaded
    });
    
    return loaded;
  }

  getLoadedModelCount(): number {
    return this.loadedModels.size;
  }



  private fixModelTransparency(model: THREE.Group, shape: 'round' | 'square'): void {
    console.log(`🔧 Fixing transparency issues for ${shape} cake...`);
    
    let materialCount = 0;
    let fixedCount = 0;
    
    model.traverse((child: any) => {
      if (child.isMesh && child.material) {
        materialCount++;
        
        // Handle both single materials and material arrays
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((mat: any, index: number) => {
          // Comprehensive transparency fix
          if (mat.transparent || mat.opacity < 1 || mat.alphaTest > 0) {
            console.log(`  🔍 Found transparent material on ${child.name || 'unnamed mesh'} (material ${index}):`, {
              transparent: mat.transparent,
              opacity: mat.opacity,
              alphaTest: mat.alphaTest,
              side: mat.side
            });
            
            // Force full opacity
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.alphaTest = 0;
            
            // Ensure proper rendering for round cakes
            if (shape === 'round') {
              mat.side = THREE.DoubleSide; // Render both sides
              mat.depthWrite = true;
              mat.depthTest = true;
            }
            
            mat.needsUpdate = true;
            fixedCount++;
            
            console.log(`  ✅ Fixed transparency on material ${index}`);
          }
          
          // Additional fixes for common transparency issues
          if (mat.map && mat.map.format === THREE.RGBAFormat) {
            mat.alphaTest = 0;
            mat.transparent = false;
            mat.needsUpdate = true;
          }
        });
        
        // Ensure mesh renders properly
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Prevent culling issues
      }
    });
    
    console.log(`🎯 Transparency fix complete for ${shape} cake: ${fixedCount}/${materialCount} materials fixed`);
  }

  private debugModelStructure(model: THREE.Group, shape: string, layers: number): void {
    console.log(`🔍 Debug: ${layers}-layer ${shape} cake model structure:`);
    
    const meshInfo: { name: string, position: THREE.Vector3, materialCount: number, hasColor: boolean }[] = [];
    
    model.traverse((child: any) => {
      if (child.isMesh) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const hasColor = materials.some((mat: any) => mat.color);
        
        meshInfo.push({
          name: child.name || 'unnamed',
          position: worldPos,
          materialCount: materials.length,
          hasColor: hasColor
        });
      }
    });
    
    // Sort by Y position for easier understanding
    meshInfo.sort((a, b) => a.position.y - b.position.y);
    
    console.log(`📊 Found ${meshInfo.length} meshes:`);
    meshInfo.forEach((info, index) => {
      console.log(`  ${index + 1}. "${info.name}" at Y=${info.position.y.toFixed(3)}, ${info.materialCount} materials, colorable: ${info.hasColor}`);
    });
    
    // Suggestions based on structure
    if (meshInfo.length > 0) {
      const bottomMesh = meshInfo[0];
      const topMesh = meshInfo[meshInfo.length - 1];
      console.log(`💡 Color Application Strategy:`);
      console.log(`   🟫 BASE (grey): "${bottomMesh.name}" - bottom component`);  
      console.log(`   🎂 LAYERS (flavor): middle meshes - cake layers`);
      console.log(`   🍰 FROSTING (user color): "${topMesh.name}" - top component`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
  }
  
  /**
   * Quick color test method - call this in your component to verify colors
   */
  testColorApplication(shape: 'round' | 'square', layers: number): void {
    console.log('🧪 TESTING COLOR APPLICATION');
    const testCake = this.getCompleteCake(shape, layers);
    if (testCake) {
      console.log(`Testing with ${shape} cake, ${layers} layers`);
      this.applyFlavorAndFrostingColors(testCake, 'chocolate', 'bg-pink-400');
      this.debugModelStructure(testCake, shape, layers);
    }
  }

  dispose(): void {
    this.loadedModels.clear();
    // Reset models
    this.models = {
      completeCakes: {
        round: { 1: null, 2: null, 3: null },
        square: { 1: null, 2: null, 3: null },
      },
    };
  }
}