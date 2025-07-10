// --- Omniverse-inspired Background Animation with Three.js ---
let scene, camera, renderer, particles;

function initAnimation() {
    scene = new THREE.Scene();
    
    // Perspective camera with wider FOV for more dramatic effect
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Setup renderer
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas,
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particle system
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 100;     // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z

        // Velocity
        velocities[i * 3] = (Math.random() - 0.5) * 0.2;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

        // Size
        sizes[i] = Math.random() * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for particles
    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0x76B900) }, // NVIDIA Green
        },
        vertexShader: `
            attribute float size;
            attribute vec3 velocity;
            uniform float time;
            
            void main() {
                vec3 pos = position + velocity * time;
                
                // Wrap particles around when they go too far
                if(pos.x > 50.0) pos.x = -50.0;
                if(pos.x < -50.0) pos.x = 50.0;
                if(pos.y > 50.0) pos.y = -50.0;
                if(pos.y < -50.0) pos.y = 50.0;
                if(pos.z > 50.0) pos.z = -50.0;
                if(pos.z < -50.0) pos.z = 50.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                if(d > 0.5) discard;
                
                float alpha = 0.5 * (1.0 - d * 2.0);
                gl_FragColor = vec4(color, alpha);
            }
        `
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x76B900, 0.2);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Update time uniform for particle movement
    particles.material.uniforms.time.value += 0.1;

    // Rotate particle system slowly
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Slide Navigation Logic ---
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove('active'));
    slides[index].classList.add('active');
    
    const progressPercentage = (index / (slides.length - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    prevBtn.style.display = index === 0 ? 'none' : 'flex';
    nextBtn.style.display = index === slides.length - 1 ? 'none' : 'flex';
}

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAnimation();
    showSlide(currentSlide); 

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        else if (e.key === 'ArrowLeft') prevSlide();
    });
});