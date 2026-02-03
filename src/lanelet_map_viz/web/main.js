import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
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

    updateCamera(vehicle) {
        if (!vehicle || !this.follow) return;
            this.controls.enabled = false;

            const target = new THREE.Vector3(vehicle.x, 9, -vehicle.y);
            this.camera.position.lerp(
                target.clone().add(new THREE.Vector3(0, 20, 50)),
                0.1
            );
            this.controls.target.lerp(target, 0.1);
    }

    render(time) {
        if (!this.running) return;
        
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.controls.update();

        this.updateCamera(vehicle.pose);
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
        
        this.scene = renderer.scene;
    }

    clear3D() { 
        this.lines3D.forEach(l => {
            l.geometry.dispose();
            l.material.dispose();
            this.scene.remove(l);
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
            vertices.push(p[0], 0, -p[1]); // y up, z forward
        });

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geometry, material);

        this.scene.add(line);
        this.lines3D.push(line);
    }

}

class VehicleEntity extends Drawable {
    constructor() {
        super();
        this.pose = null;
    }

    setPose(pose) {
        this.pose = pose;
    }

    update(dt) {
        // future update velocity smoothing, prediction, etc
    }

    draw2D(renderer) {
        if (!this.pose) return;

        const { x, y, yaw } = this.pose;
        const s = renderer.worldToScreen(x, y);

        const ctx = renderer.ctx;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(-yaw);

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-10, -6);
        ctx.lineTo(-10, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
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

// add drawables ONCE
renderer.add(lanelets);
renderer.add(vehicle);

renderer3d.add(lanelets);
renderer3d.add(vehicle);

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
    } else {
        canvas.style.display = "block";
        renderer3d.stop();
        threeContainer.style.display = "none";
        
        renderer.start();
        document.getElementById("toggleView").innerText = "Switch to 3D";
        
    }
});

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
    }
});

// DATA FETCH
function fetchData() {
    fetch(DATA_URL)
        .then(r => r.json())
        .then(d => {
            lanelets.mapData = d.map;
            if (d.map && !mapData) {
                lanelets.build3D();
                computeMapCenter(d.map);
            }
            vehicle.setPose(d.vehicle);
        })
        .catch(() => {});
}

setInterval(fetchData, 100);