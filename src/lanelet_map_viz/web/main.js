import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {STLLoader} from "three/addons/loaders/STLLoader.js"

// base class
class Drawable {
    onAdd(renderer) {}
    update(dt) {}
    draw2D(renderer) {}
    draw3D(renderer) {}
}

class Renderer2D {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.camera = {
            x: 0,
            y: 0,
            zoom: 5,
            follow: true
        };

        this.drawables = [];
        this.lastTime = performance.now();
        
        this.running = false;
        this.render = this.render.bind(this);
    }

    //start and stopping the running for toggle purposes
    start() {
        if (this.running) return;
        this.running = true;
        requestAnimationFrame(this.render);
    }

    stop() {
        this.running = false;
    }

    add(drawable) {
        this.drawables.push(drawable);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCamera(vehicle) {
        if (!vehicle || !this.camera.follow) return;
        this.camera.x += (vehicle.x - this.camera.x) * 0.1;
        this.camera.y += (vehicle.y - this.camera.y) * 0.1;
    }

    worldToScreen(x, y) {
        return {
            x: (x - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
            y: -(y - this.camera.y) * this.camera.zoom + this.canvas.height / 2
        };
    }

    render(time) {

        if (!this.running) return;

        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.updateCamera(vehicle.pose);
        this.clear();

        for (const d of this.drawables) {
            d.update(dt);
            d.draw2D?.(this);
        }

        requestAnimationFrame(this.render);
    }
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
            color: 0x2a2a2a,
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

    updateCamera() {
        if (!this.follow) return;

        const v = this.drawables.find(d => d instanceof VehicleEntity);
        if (!v?.pose) return;

        const { x, y, yaw } = v.pose;

        // Vehicle forward direction in 2D → convert to Three.js (z = -2D y)
        const forwardX = Math.cos(yaw);     // +X in world
        const forwardZ = -Math.sin(yaw);    // +Z in Three.js = -2D Y direction

        const distanceBehind = 8;
        const height = 3;
        const lookAhead = 8;

        const idealPos = new THREE.Vector3(
            x - forwardX * distanceBehind,
            height,
            -y - forwardZ * distanceBehind   // note the signs
        );

        const idealTarget = new THREE.Vector3(
            x + forwardX * lookAhead,
            1.5,
            -y + forwardZ * lookAhead
        );

        // smooth follow
        this.camera.position.lerp(idealPos, 0.12);
        this.controls.target.lerp(idealTarget, 0.18);
    }
    render(time) {
        if (!this.running) return;
        
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.controls.update();

        this.updateCamera();
        this.camera.position.y = Math.max(this.camera.position.y, 2); // prevent going underground
        this.drawables.forEach(d => { 
            d.update?.(dt);
            d.draw3D?.(this);
        });
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render);
    }
}


class LaneletLayer extends Drawable {
    constructor(mapData) {
        super();
        this.mapData = mapData;
        this.lines3D = [];
    }

    draw2D(renderer) {
        if (!this.mapData) return;

        this.mapData.forEach(ll => {
            this.drawLine(renderer, ll.left, "#ffffff", 2);
            this.drawLine(renderer, ll.right, "#ffffff", 2);
            this.drawLine(renderer, ll.center, "#0000ff", 0.5);
        });
    }

    drawLine(renderer, points, color, width) {
        const ctx = renderer.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();

        points.forEach((p, i) => {
            const s = renderer.worldToScreen(p[0], p[1]);
            i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
        });

        ctx.stroke();
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
            this.addLine3D(ll.left, 0xffff00);
            this.addLine3D(ll.right, 0xffffff);
            this.addLine3D(ll.center, 0x0000ff);
        });
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
        this.angularSpeed = 0.0;
    }

    onAdd(renderer) {
        if (!(renderer instanceof Renderer3d)) return;

        this.vGroup = new THREE.Group();
        renderer.layers.vehicles.add(this.vGroup);

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
        this.t += dt * this.angularSpeed;
        const x = Math.cos(this.t) * this.radius;
        const y = Math.sin(this.t) * this.radius;

        // compute yaw from actual movement direction
        if (this.pose) {
            const dx = x - this.pose.x;
            const dy = y - this.pose.y;
            if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
                this.pose = { x, y, yaw: Math.atan2(dy, dx) };
            } else {
                this.pose = { x, y, yaw: this.pose.yaw };
            }
        } else {
            this.pose = { x, y, yaw: 0 };
        }
    }

    draw2D(renderer) {
        if (!this.pose) return;
        const { x, y, yaw } = this.pose;
        const s = renderer.worldToScreen(x, y);
        const ctx = renderer.ctx;

        ctx.save();
        ctx.translate(s.x, s.y);

        // outer blue circle
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 122, 255, 0.2)";
        ctx.fill();

        // inner filled blue circle
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#007AFF";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // direction arrow — rotated by yaw
        ctx.rotate(-yaw);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -14);   // tip
        ctx.lineTo(-5, -6);   // left base
        ctx.lineTo(5, -6);    // right base
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    draw3D(renderer){
    if (!this.vGroup || !this.pose) return;
    const { x, y, yaw } = this.pose;
    this.vGroup.position.set(x, 0, -y);
    this.vGroup.rotation.y = yaw + Math.PI / 2;
    if (!this.axesHelper) {
        this.axesHelper = new THREE.AxesHelper(8); // red = +X local, green = +Y up, blue = +Z local
        this.vGroup.add(this.axesHelper);
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

    draw2D(renderer) {
        Object.entries(this.stops).forEach(([key, stop]) => {
            const s = renderer.worldToScreen(stop.x, stop.y);
            const ctx = renderer.ctx;
            const isStart = key === this.selectedStart;
            const isGoal  = key === this.selectedGoal;

            // pin circle
            ctx.beginPath();
            ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = isStart ? "#00ff00" : isGoal ? "#ff4444" : "#ffaa00";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // label
            ctx.fillStyle = "#ffffff";
            ctx.font = "11px sans-serif";
            ctx.fillText(stop.display_name, s.x + 12, s.y + 4);
        });
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
    }

    setWaypoints(waypoints) {
        this.waypoints = waypoints;
    }

    draw2D(renderer) {
        if (this.waypoints.length < 2) return;
        const ctx = renderer.ctx;
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        this.waypoints.forEach((p, i) => {
            const s = renderer.worldToScreen(p[0], p[1]);
            i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
    }
}


const canvas = document.getElementById("map");
const threeContainer = document.getElementById("three-container");

const ctx = canvas.getContext("2d");

const renderer = new Renderer2D(canvas);
const renderer3d = new Renderer3d(threeContainer)

const DATA_URL = `http://localhost:${PORT}/data`;

let mapData = null;
let mapCenter = {x: 0, y: 0 };

const lanelets = new LaneletLayer(mapData);
const vehicle = new VehicleEntity();

const stopsLayer = new StopsLayer();
const routeLayer = new RouteLayer();

// add drawables ONCE
renderer.add(lanelets);
renderer.add(vehicle);

renderer3d.add(lanelets);
renderer3d.add(vehicle);

renderer.add(stopsLayer);
renderer.add(routeLayer);

renderer3d.add(stopsLayer);

// start in 2D
renderer.start();
threeContainer.style.display = "none";

let is3D = false;

document.getElementById("toggleView").addEventListener("click", () => {
    is3D = !is3D;

    if (is3D) {
        renderer.stop();
        canvas.style.display = "none";
        threeContainer.style.display = "block";
        renderer3d.start();
        renderer3d.camera.position.set(mapCenter.x, 30, -mapCenter.y + 50);
        renderer3d.camera.lookAt(mapCenter.x, 0, -mapCenter.y);
        document.getElementById("toggleView").innerText = "Switch to 2D";
        document.getElementById("controls-2d").style.display = "none";
        document.getElementById("controls-3d").style.display = "inline";
    } else {
        canvas.style.display = "block";
        renderer3d.stop();
        threeContainer.style.display = "none";
        
        renderer.start();
        document.getElementById("toggleView").innerText = "Switch to 3D";
        document.getElementById("controls-2d").style.display = "inline";
        document.getElementById("controls-3d").style.display = "none";
    }
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
    renderer.camera.x = mapCenter.x;
    renderer.camera.y = mapCenter.y;
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// mouse drag to PAN
let dragging = false;
let lastMouse = {x: 0, y: 0};

canvas.addEventListener("mousedown", e => {
    dragging = true;
    renderer.camera.follow = false;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
});

canvas.addEventListener("mouseup", () => {
    dragging = false;
});

canvas.addEventListener("mousemove", e => {
    if (!dragging) return;

    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;

    renderer.camera.x -= dx / renderer.camera.zoom;
    renderer.camera.y += dy / renderer.camera.zoom;

    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
});

canvas.addEventListener("wheel", e => {
    e.preventDefault();

    const zoomFactor = 1.1;
    const mouseX = e.clientX - canvas.width / 2;
    const mouseY = e.clientY - canvas.height / 2;

    const wx = mouseX / renderer.camera.zoom + renderer.camera.x;
    const wy = -mouseY / renderer.camera.zoom + renderer.camera.y;

    if (e.deltaY < 0) renderer.camera.zoom *= zoomFactor;
    else renderer.camera.zoom /= zoomFactor;

    renderer.camera.zoom = Math.min(Math.max(renderer.camera.zoom, 0.5), 40);

    renderer.camera.x = wx - mouseX / renderer.camera.zoom;
    renderer.camera.y = wy + mouseY / renderer.camera.zoom;
    console.log("zoom:", renderer.camera.zoom)
});

window.addEventListener("keydown", e => {
    if (e.key === "f") {
        renderer.camera.follow = true;
        renderer3d.follow = true;
    }
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer3d.renderer.setSize(window.innerWidth, window.innerHeight);
    renderer3d.camera.aspect = window.innerWidth / window.innerHeight;
    renderer3d.camera.updateProjectionMatrix();
});

// DATA FETCH
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
        })
        .catch(() => {});
}


// Fetch stops once on load and populate dropdowns
function fetchStops() {
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
        .catch(() => setTimeout(fetchStops, 500));
}
fetchStops();

function updateSelection() {
    const start = document.getElementById("startSelect").value;
    const goal  = document.getElementById("goalSelect").value;
    stopsLayer.setSelection(start, goal);
}

document.getElementById("startSelect")?.addEventListener("change", updateSelection);
document.getElementById("goalSelect")?.addEventListener("change", updateSelection);

// Compute route button — calls /route and draws waypoints
// ---- ROUTING INTERFACE: ----
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
    })
    .catch(err => console.error("Route request failed:", err));
});

setInterval(fetchData, 100);
