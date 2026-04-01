import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {STLLoader} from "three/addons/loaders/STLLoader.js"

let routeWaypoints = [];
let routeStartTime = null;
let routeTotalTime = 0; //seconds
const SPEED_MPS = 5; //meters/sec

// base class
class Drawable {
    onAdd(renderer) {}
    update(dt) {}
    draw3D(renderer) {}
}

class Renderer3d {
    constructor(threeContainer) {
        this.container = threeContainer;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
            );
        this.camera.position.set(0, 20, 50);        
        
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.drawables = [];
        this.lastTime = performance.now();

        this.running = false;
        this.render = this.render.bind(this);
        this.follow = true;

        //set up orbit controls for camera manipulation
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.minPolarAngle = 0; // allow looking straight down
        this.controls.maxPolarAngle = Math.PI / 2; // prevent going underground
        this.controls.minDistance = 5;
        this.controls.maxTargetRadius = 2000;
        this.camera.near = 0.5;
        this.camera.far = 5000;
        this.camera.updateProjectionMatrix();

        //topdowncamera
        this.topDownCamera = new THREE.OrthographicCamera(
            -window.innerWidth /2, //left
            window.innerWidth /2,
            window.innerHeight /2,
            -window.innerHeight /2,
            0.1,
            5000
        );
        
        this.topDownCamera.position.set(0, 500, 0);
        this.topDownCamera.lookAt(0, 0, 0);
        this.topDownCamera.zoom = 15;
        this.topDownCamera.updateProjectionMatrix();

        this.activeCamera = this.camera; //start in 3d
        this.is2D = false;

        this.world = new THREE.Group();
        this.scene.add(this.world);

        this.layers = {
            ground: new THREE.Group(),
            roads: new THREE.Group(),
            laneMarkings: new THREE.Group(),
            vehicles: new THREE.Group(),
            debug: new THREE.Group()
        };

        this.controls.addEventListener('start', () => {
            this.follow = false;
        });

        Object.values(this.layers).forEach(g => this.world.add(g));

        //set ground plane
        const groundGeo = new THREE.PlaneGeometry(5000, 5000);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x90c97a,
            roughness: 1,
            metalness: 0
        });

        //lie flat and receive shadows
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;

        this.layers.ground.add(ground);

        // ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, -50);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        //road mesh
        this.roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b3b3b, 
            roughness: 0.9
        });
    }

    start() {
        if (this.running) return;
        this.running = true;
        requestAnimationFrame(this.render);
    }

    stop(){
        this.running = false;
    }

    add(drawable) {
        drawable.onAdd?.(this);
        //prevent duplicates
        if (!this.drawables.includes(drawable)){
            this.drawables.push(drawable);
        }
    }

    toggle2D() {
        this.is2D = !this.is2D;
        if (this.is2D) {
            this.activeCamera = this.topDownCamera;
            this.controls.enableRotate = false; //lock rotation
            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
            // sync controls target to top down camera position
            this.controls.object = this.topDownCamera;
            this.controls.update();
        } else { 
            this.activeCamera = this.camera;
            this.controls.enableRotate = true;
            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
            this.controls.object = this.camera;
            this.controls.update();
        }
    }

    updateCamera() {
        if (!this.follow) return;

        const v = this.drawables.find(d => d instanceof VehicleEntity);
        if (!v?.pose) return;

        const { x, y, yaw } = v.pose;

        if (this.is2D) {
            // top down — just follow position, no rotation
            this.topDownCamera.position.set(x, 500, -y);
            this.topDownCamera.lookAt(x, 0, -y);
            this.controls.target.set(x, 0, -y);
        } else {
            // 3D follow — existing code
            const forwardX = Math.cos(yaw);
            const forwardZ = -Math.sin(yaw);
            const distanceBehind = 8;
            const height = 3;
            const lookAhead = 8;

            const idealPos = new THREE.Vector3(
                x - forwardX * distanceBehind, height,
                -y - forwardZ * distanceBehind
            );
            const idealTarget = new THREE.Vector3(
                x + forwardX * lookAhead, 1.5,
                -y + forwardZ * lookAhead
            );

            this.camera.position.lerp(idealPos, 0.12);
            this.controls.target.lerp(idealTarget, 0.18);
        }
    }


    render(time) {
        if (!this.running) return;
        
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.controls.update();

        this.updateCamera();
        if (!this.is2D){
            this.camera.position.y = Math.max(this.camera.position.y, 2); // prevent going underground
        }
        this.drawables.forEach(d => { 
            d.update?.(dt);
            d.draw3D?.(this);
        });
        updateTimer();
        this.renderer.render(this.scene, this.activeCamera);

        requestAnimationFrame(this.render);
    }
}

class LaneletLayer extends Drawable {
    constructor(mapData) {
        super();
        this.mapData = mapData;
        this.lines3D = [];
    }

    onAdd(renderer) {
        if (!(renderer instanceof Renderer3d)) return;
        
        this.lineGroup = new THREE.Group();
        renderer.layers.laneMarkings.add(this.lineGroup);
    
        this.build3D();
    }


    clear3D() { 
        this.lines3D.forEach(l => {
            l.geometry.dispose();
            l.material.dispose();
            this.lineGroup.remove(l);
        });
        this.lines3D = [];
    }

    build3D() {
        this.clear3D();

        if (!this.mapData) return;

        this.mapData.forEach(ll => {
            this.addRoadMesh(ll);  
            this.addLine3D(ll.left, 0xffffff);
            this.addLine3D(ll.right, 0xffffff);
        });
    }

    addRoadMesh(ll) {
        const positions = [];
        const indices = [];
        const left  = ll.left;
        const right = ll.right;

        // interpolate the shorter array to match the longer one
        const count = Math.max(left.length, right.length);

        function interpolate(pts, count) {
            if (pts.length === count) return pts;
            const result = [];
            for (let i = 0; i < count; i++) {
                const t = i / (count - 1);
                const srcT = t * (pts.length - 1);
                const lo = Math.floor(srcT);
                const hi = Math.min(lo + 1, pts.length - 1);
                const f = srcT - lo;
                result.push([
                    pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f,
                    pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f
                ]);
            }
            return result;
        }

        const leftPts  = interpolate(left,  count);
        const rightPts = interpolate(right, count);

        for (let i = 0; i < count; i++) {
            positions.push(
                leftPts[i][0],  0.01, -leftPts[i][1],
                rightPts[i][0], 0.01, -rightPts[i][1]
            );

            if (i < count - 1) {
                const base = i * 2;
                indices.push(
                    base,     base + 1, base + 2,
                    base + 1, base + 3, base + 2
                );
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        this.lineGroup.add(mesh);
        this.lines3D.push(mesh);
    }


    addLine3D(points, color) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        points.forEach(p => {
            vertices.push(p[0], 0.02, -p[1]); // y up, z forward
        });

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geometry, material);

        this.lineGroup.add(line);
        this.lines3D.push(line);
    }

}

class VehicleEntity extends Drawable {
    constructor() {
        super();
        this.pose = null;
        this.mesh = null;

        //fake motion state
        this.t = 0;
        this.radius = 25;

        this.angularSpeed = 0.4;
    }

    setPose(pose) {
        if (pose) this.useRealPose = true;
        this.pose = pose;
    }

    onAdd(renderer) {

        if (!(renderer instanceof Renderer3d)) return;  
    
        this.vGroup = new THREE.Group();                 // create vGroup
        renderer.layers.vehicles.add(this.vGroup);       // add to scene
        
        const loader = new STLLoader();
        loader.load("./models/Transit_2.stl", geometry => {
            // STLLoader returns geometry, not an object
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x4444ff,
                roughness: 0.5,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);

                // get raw model dimensions before any scaling
            const box = new THREE.Box3().setFromObject(mesh);
            const size = box.getSize(new THREE.Vector3());
            console.log("Raw model size:", size);


            const TARGET_WIDTH = 2.5; // meters match lane width
            const scale = TARGET_WIDTH / size.x; // scale based on model's width axis
            mesh.scale.set(scale, scale, scale);
            mesh.rotation.set(0, 0, 0); 
            
            // re-center after scaling
            const scaledBox = new THREE.Box3().setFromObject(mesh);
            const center = scaledBox.getCenter(new THREE.Vector3());
            mesh.position.set(-center.x, -scaledBox.min.y, -center.z);

            this.mesh = new THREE.Group();
            this.mesh.add(mesh);
            this.vGroup.add(this.mesh);

        },
        xhr => console.log(`Model: ${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`),
        err => console.error("STL load error:", err)
        );
    }

    update(dt) {
        if (this.useRealPose) return;

        this.t += dt * this.angularSpeed;
        const x = Math.cos(this.t) * this.radius;
        const y = Math.sin(this.t) * this.radius;
        const targetYaw = Math.atan2(
            Math.cos(this.t),
            -Math.sin(this.t)
        );

        if (this.pose) {
            let dyaw = targetYaw - this.pose.yaw;
            while (dyaw >  Math.PI) dyaw -= 2 * Math.PI;
            while (dyaw < -Math.PI) dyaw += 2 * Math.PI;
            const smoothYaw = this.pose.yaw + dyaw * 0.2;
            this.pose = { x, y, yaw: smoothYaw };
        } else {
            this.pose = { x, y, yaw: targetYaw };
        }
    }

    draw3D(renderer) {
        if (!this.vGroup || !this.pose) return;
        const { x, y, yaw } = this.pose;
        this.vGroup.position.set(x, 0, -y);
        this.vGroup.rotation.y = yaw + Math.PI / 2;

        // scale model up when zoomed out in top-down mode
        if (renderer.is2D) {
            const s = Math.max(1, 8 / renderer.topDownCamera.zoom);
            this.vGroup.scale.set(s, s, s);
        } else {
            this.vGroup.scale.set(1, 1, 1);
        }
    }
}

class StopsLayer extends Drawable {
    constructor() {
        super();
        this.stops = {};         // populated from /stops fetch
        this.selectedStart = null;
        this.selectedGoal  = null;
    }

    setStops(stops) {
        this.stops = stops;
    }

    setSelection(startKey, goalKey) {
        this.selectedStart = startKey;
        this.selectedGoal  = goalKey;
    }

    onAdd(renderer) {
        if (!(renderer instanceof Renderer3d)) return;
        this.scene = renderer.scene;
        this.markers3D = [];
    }

    draw3D(renderer) {
        // remove old markers
        this.markers3D.forEach(m => this.scene.remove(m));
        this.markers3D = [];

        Object.entries(this.stops).forEach(([key, stop]) => {
            const isStart = key === this.selectedStart;
            const isGoal  = key === this.selectedGoal;
            const color = isStart ? 0x00ff00 : isGoal ? 0xff4444 : 0xffaa00;

            // sphere marker
            const geo = new THREE.SphereGeometry(3, 10, 10);
            const mat = new THREE.MeshBasicMaterial({ color });
            const sphere = new THREE.Mesh(geo, mat);
            sphere.position.set(stop.x, 1, -stop.y); // y up, z forward same as your map

            this.scene.add(sphere);
            this.markers3D.push(sphere);
        });
    }
}

class RouteLayer extends Drawable {
    constructor() {
        super();
        this.waypoints = [];
        this.line3D = null;
    }

    onAdd(renderer) {
        if (!(renderer instanceof Renderer3d)) return;
        this.scene = renderer.scene;
    }

    setWaypoints(waypoints) {
        this.waypoints = waypoints;
        this.rebuild3D();
    }

    rebuild3D() {
        if (this.line3D) {
            this.scene?.remove(this.line3D);
            this.line3D.geometry.dispose();
            this.line3D.material.dispose();
            this.line3D = null;
        }
        if (this.waypoints.length < 2 || !this.scene) return;

        // build a ribbon mesh along the route instead of a line
        const laneWidth = 3.5; // meters — adjust to match your lane width
        const positions = [];
        const indices = [];

        for (let i = 0; i < this.waypoints.length; i++) {
            const p = this.waypoints[i];

            // compute direction to next point (or from previous)
            let dx, dz;
            if (i < this.waypoints.length - 1) {
                const next = this.waypoints[i + 1];
                dx = next[0] - p[0];
                dz = -(next[1] - p[1]);
            } else {
                const prev = this.waypoints[i - 1];
                dx = p[0] - prev[0];
                dz = -(p[1] - prev[1]);
            }

            // normalize
            const len = Math.sqrt(dx * dx + dz * dz) || 1;
            dx /= len; dz /= len;

            // perpendicular for lane width
            const px = -dz * laneWidth / 2;
            const pz =  dx * laneWidth / 2;

            // left and right edge vertices
            positions.push(
                p[0] + px, 0.05, -p[1] + pz,   // left
                p[0] - px, 0.05, -p[1] - pz    // right
            );

            // build quad between this segment and the next
            if (i < this.waypoints.length - 1) {
                const base = i * 2;
                indices.push(
                    base,     base + 1, base + 2,
                    base + 1, base + 3, base + 2
                );
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide,
            depthWrite: false  // prevents z-fighting with ground
        });

        this.line3D = new THREE.Mesh(geometry, material);
        this.scene.add(this.line3D);
    }
}

class KinematicsLayer extends Drawable {
    constructor() {
        super();
        this.predicted = [];
        this.tracked = [];
        this.markers = [];
    }

    onAdd(renderer) {
        if (!(renderer instanceof Renderer3d)) return;
        this.scene = renderer.scene;
        this.markers = [];
    }

    setData(predicted, tracked) {
        this.predicted = predicted || [];
        this.tracked = tracked || [];
    }

    draw3D(renderer) {
        // remove old markers
        this.markers.forEach(m => this.scene.remove(m));
        this.markers = [];

        // tracked objects — red spheres
        this.tracked.forEach(obj => {
            const geo = new THREE.SphereGeometry(1, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geo, mat);
            sphere.position.set(obj.x, 1, -obj.y);
            this.scene.add(sphere);
            this.markers.push(sphere);
        });

        // predicted objects — blue spheres
        this.predicted.forEach(obj => {
            const geo = new THREE.SphereGeometry(1, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ 
                color: 0x0000ff,
                transparent: true,
                opacity: 0.6
            });
            const sphere = new THREE.Mesh(geo, mat);
            sphere.position.set(obj.x, 1, -obj.y);
            this.scene.add(sphere);
            this.markers.push(sphere);
        });
    }
}

// Fetch stops once on load and populate dropdowns
function fetchStops(stopsLayer) {
    fetch(`http://localhost:${PORT}/stops`)
        .then(r => r.json())
        .then(stops => {
            console.log("stops received:", Object.keys(stops).length, stops);
            if (Object.keys(stops).length === 0) {
                console.warn("Received empty stops data");
                setTimeout(fetchStops, 500);
                return;
            }
            stopsLayer.setStops(stops);

            const startSel = document.getElementById("startSelect");
            const goalSel  = document.getElementById("goalSelect");

            Object.entries(stops).forEach(([key, stop]) => {
                [startSel, goalSel].forEach(sel => {
                    const opt = document.createElement("option");
                    opt.value = key;
                    opt.textContent = stop.display_name;
                    sel.appendChild(opt);
                });
            });

            // default goal to second stop so they're not the same
            if (goalSel.options.length > 1) goalSel.selectedIndex = 1;

            updateSelection();
        })
        .catch(() => setTimeout(() => fetchStops(stopsLayer), 500));
}

function updateSelection(stopsLayer) {
    const start = document.getElementById("startSelect").value;
    const goal  = document.getElementById("goalSelect").value;
    stopsLayer.setSelection(start, goal);
}

//compute route lenght
function computeRouteLength(waypoints) {
    let length = 0;

    for (let i = 1; i < waypoints.length; i++) {
        const dx = waypoints[i][0] - waypoints[i - 1][0];
        const dy = waypoints[i][1] - waypoints[i - 1][1];
        length += Math.sqrt(dx * dx + dy * dy);
    }

    return length; // meters (since your ENU map is meters)
}

//update timer every frame
function updateTimer() {
    if (!routeStartTime) return;

    const elapsed = (performance.now() - routeStartTime) / 1000;
    const remaining = Math.max(routeTotalTime - elapsed, 0);

    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);

    const timer =  document.getElementById("timeRemaining");
    if (timer) {
        timer.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;
    }
    document.getElementById("timeRemaining").textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


function main(){
    //set up map scene and load data
    const threeContainer = document.getElementById("three-container");
    const renderer3d = new Renderer3d(threeContainer)
    const DATA_URL = `http://localhost:${PORT}/data`;

    let mapData = null;
    let mapCenter = {x: 0, y: 0 };

    //create drawables
    const lanelets = new LaneletLayer(mapData);
    const vehicle = new VehicleEntity();
    const stopsLayer = new StopsLayer();
    const routeLayer = new RouteLayer();
    const kinematicsLayer = new KinematicsLayer();

    // add drawables ONCE
    renderer3d.add(lanelets);
    renderer3d.add(vehicle);
    renderer3d.add(stopsLayer);
    renderer3d.add(routeLayer);
    renderer3d.add(kinematicsLayer);

    // start in 2Dcamera
    renderer3d.toggle2D();  // start in top-down
    threeContainer.style.display = "block";
    renderer3d.start();

    document.getElementById("toggleView").addEventListener("click", () => {
        renderer3d.toggle2D();
        const btn = document.getElementById("toggleView");
        btn.innerText = renderer3d.is2D ? "Switch to 3D" : "Top Down View";
        document.getElementById("controls-2d").style.display = renderer3d.is2D ? "inline" : "none";
        document.getElementById("controls-3d").style.display = renderer3d.is2D ? "none" : "inline";
    });


    window.addEventListener("keydown", e => {
        if (e.key === "f") {
            renderer3d.follow = true;
        }
    });

    window.addEventListener("resize", () => {
        renderer3d.renderer.setSize(window.innerWidth, window.innerHeight);
        renderer3d.camera.aspect = window.innerWidth / window.innerHeight;
        renderer3d.camera.updateProjectionMatrix();
        renderer3d.topDownCamera.left   = -window.innerWidth / 2;
        renderer3d.topDownCamera.right  =  window.innerWidth / 2;
        renderer3d.topDownCamera.top    =  window.innerHeight / 2;
        renderer3d.topDownCamera.bottom = -window.innerHeight / 2;
        renderer3d.topDownCamera.updateProjectionMatrix();
    });

    function fetchData() {
        fetch(DATA_URL)
            .then(r => r.json())
            .then(d => {
                lanelets.mapData = d.map;
                if (d.map && !mapData) {
                    mapData = d.map;
                    lanelets.build3D();
                    computeMapCenter(d.map);
                }
                vehicle.setPose(d.vehicle);
                kinematicsLayer.setData(d.predicted_objects, d.tracked_objects);
            })
            .catch(() => {});
    }

    fetchStops(stopsLayer);

    document.getElementById("startSelect")?.addEventListener("change", () => updateSelection(stopsLayer));
    document.getElementById("goalSelect")?.addEventListener("change", () => updateSelection(stopsLayer));

    //routing 
    document.getElementById("computeRoute")?.addEventListener("click", () => {
        const start = document.getElementById("startSelect").value;
        const goal  = document.getElementById("goalSelect").value;

        fetch(`http://localhost:${PORT}/route`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start, goal })
        })
        .then(r => r.json())
        .then(data => {
            routeLayer.setWaypoints(data.waypoints);
            routeWaypoints = data.waypoints;
            const length = computeRouteLength(routeWaypoints);

            routeTotalTime = length / SPEED_MPS;
            routeStartTime = performance.now();

            console.log("route lenght:", lenght, "meters");
            console.log("ETA:", routeTotalTime, "seconds");
        })
        .catch(err => console.error("Route request failed:", err));
    });

    function computeMapCenter(mapData) {
        let sumX = 0, sumY = 0, count = 0;
        mapData.forEach(ll => {
            ll.center.forEach(p => {
                sumX += p[0]; sumY += p[1]; count++;
            });
        });
        mapCenter.x = sumX / count;
        mapCenter.y = sumY / count;

        // center the top down camera on first load
        renderer3d.topDownCamera.position.set(mapCenter.x, 500, -mapCenter.y);
        renderer3d.topDownCamera.lookAt(mapCenter.x, 0, -mapCenter.y);
        renderer3d.controls.target.set(mapCenter.x, 0, -mapCenter.y);
    }

    
    setInterval(fetchData, 100);
}
main();
