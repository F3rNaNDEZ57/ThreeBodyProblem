// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Celestial bodies array
const bodies = [];
const velocities = [];

// Plane for raycaster intersection (assuming the interaction plane is z=0)
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 500);
light.position.set(10, 10, 10);
scene.add(light);

// Add celestial body function
function addCelestialBody(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    const body = new THREE.Mesh(geometry, material);
    body.position.set(x, y, z);
    bodies.push(body);
    velocities.push(new THREE.Vector3(0, 0, 0)); // Initial velocity is zero
    scene.add(body);
}

// Mouse click event listener
function onMouseClick(event) {
    // Transform mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Calculate the intersection point
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);

    // Add a celestial body at the intersection point
    addCelestialBody(target.x, target.y, 0);
}

renderer.domElement.addEventListener('click', onMouseClick, false);

// Constants
const G = 1; // Gravitational constant, adjust as needed
const dt = 0.1; // Time step for simulation

// Function to update positions based on gravitational forces
function updatePositions() {
    const forces = bodies.map(() => new THREE.Vector3(0, 0, 0));

    // Calculate gravitational forces between all pairs of bodies
    bodies.forEach((body, i) => {
        bodies.forEach((other, j) => {
            if (i !== j) {
                const direction = new THREE.Vector3().subVectors(other.position, body.position);
                const distance = direction.length();
                const forceMagnitude = (G * 0.5 * 0.5) / (distance * distance + 0.1); // mass assumed 0.5
                const force = direction.normalize().multiplyScalar(forceMagnitude);
                forces[i].add(force);
            }
        });
    });

    // Update velocities and positions
    bodies.forEach((body, i) => {
        velocities[i].add(forces[i].multiplyScalar(dt));
        body.position.add(velocities[i].clone().multiplyScalar(dt));
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updatePositions();
    renderer.render(scene, camera);
}

animate();

// Camera positioning
camera.position.z = 50;
