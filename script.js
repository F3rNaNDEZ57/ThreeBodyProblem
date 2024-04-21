// Setting up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creating the celestial bodies with different colors
const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Slightly increased detail
const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });

const body1 = new THREE.Mesh(geometry, material1);
const body2 = new THREE.Mesh(geometry, material2);
const body3 = new THREE.Mesh(geometry, material3);

body1.position.set(-10, 0, 0);
body2.position.set(10, 0, 0);
body3.position.set(0, 10, 0);

scene.add(body1);
scene.add(body2);
scene.add(body3);

// Initial velocities
let vel1 = new THREE.Vector3(0.5, 0.2, 0);
let vel2 = new THREE.Vector3(-0.5, -0.2, 0);
let vel3 = new THREE.Vector3(0, 0, 0);

// Initialize trails
const trailLength = 1000; // Number of points in the trail
const trailMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
const trailGeometry1 = new THREE.BufferGeometry();
const trailGeometry2 = new THREE.BufferGeometry();
const trailGeometry3 = new THREE.BufferGeometry();

// Initialize positions for trails
const positions1 = new Float32Array(trailLength * 3);
const positions2 = new Float32Array(trailLength * 3);
const positions3 = new Float32Array(trailLength * 3);
trailGeometry1.setAttribute('position', new THREE.BufferAttribute(positions1, 3));
trailGeometry2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
trailGeometry3.setAttribute('position', new THREE.BufferAttribute(positions3, 3));

const trailLine1 = new THREE.Line(trailGeometry1, trailMaterial);
const trailLine2 = new THREE.Line(trailGeometry2, trailMaterial);
const trailLine3 = new THREE.Line(trailGeometry3, trailMaterial);
scene.add(trailLine1, trailLine2, trailLine3);

let trailIndex = 0;

// Function to update positions based on gravitational forces and update trails
function updatePositions() {
  const G = 10; // Gravitational constant
  const dt = 0.05; // Time step

  const pos1 = body1.position.clone();
  const pos2 = body2.position.clone();
  const pos3 = body3.position.clone();

  // Calculate distances between bodies
  const dist12 = pos2.distanceTo(pos1);
  const dist13 = pos3.distanceTo(pos1);
  const dist23 = pos3.distanceTo(pos2);

  // Calculate gravitational forces
  const force12 = G * (1 / (dist12 * dist12 + 0.1)); // Softening factor to avoid singularities
  const force13 = G * (1 / (dist13 * dist13 + 0.1));
  const force23 = G * (1 / (dist23 * dist23 + 0.1));

  // Calculate force vectors
  const force12Vector = pos2.clone().sub(pos1).normalize().multiplyScalar(force12);
  const force13Vector = pos3.clone().sub(pos1).normalize().multiplyScalar(force13);
  const force23Vector = pos3.clone().sub(pos2).normalize().multiplyScalar(force23);

  // Calculate accelerations
  const acc1 = force12Vector.add(force13Vector);
  const acc2 = force12Vector.clone().negate().add(force23Vector);
  const acc3 = force13Vector.clone().negate().add(force23Vector.clone().negate());

  // Update velocities
  vel1.add(acc1.multiplyScalar(dt));
  vel2.add(acc2.multiplyScalar(dt));
  vel3.add(acc3.multiplyScalar(dt));

  // Update positions using velocities
  body1.position.add(vel1.clone().multiplyScalar(dt));
  body2.position.add(vel2.clone().multiplyScalar(dt));
  body3.position.add(vel3.clone().multiplyScalar(dt));

  // Update trail positions
  for (let i = trailLength - 1; i > 0; i--) {
      positions1.set(positions1.subarray(0, positions1.length - 3), 3);
      positions2.set(positions2.subarray(0, positions2.length - 3), 3);
      positions3.set(positions3.subarray(0, positions3.length - 3), 3);
  }
  positions1[0] = pos1.x;
  positions1[1] = pos1.y;
  positions1[2] = pos1.z;
  positions2[0] = pos2.x;
  positions2[1] = pos2.y;
  positions2[2] = pos2.z;
  positions3[0] = pos3.x;
  positions3[1] = pos3.y;
  positions3[2] = pos3.z;

  // Mark the trail geometries for update
  trailGeometry1.attributes.position.needsUpdate = true;
  trailGeometry2.attributes.position.needsUpdate = true;
  trailGeometry3.attributes.position.needsUpdate = true;
}


// Position camera
camera.position.z = 50;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updatePositions();
    renderer.render(scene, camera);
}

animate();
