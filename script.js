
// ===============================
// 1. スクロールで浮かび上がる
// ===============================

// ===============================
// スクロールで浮かび上がる
// ===============================

const fadeElements = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0,
    rootMargin: "0px 0px 50px 0px"
});

fadeElements.forEach(element => {
    observer.observe(element);
});

// ===============================
// 2. マウス追従の光
// ===============================

const glow = document.querySelector(".cursor-glow");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;

    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;

    requestAnimationFrame(animateGlow);
}

animateGlow();


// ===============================
// 3. 3Dカードエフェクト
// ===============================

const cards = document.querySelectorAll(".hobby-card");

cards.forEach(card => {

    card.addEventListener("mousemove", (event) => {

        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (centerY - y) / 15;
        const rotateY = (x - centerX) / 15;

        card.style.transform =
            `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform =
            "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
    });

});


// ===============================
// 4. 背景パーティクル
// ===============================

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticles() {

    particles = [];

    const count = Math.min(
        Math.floor(window.innerWidth / 12),
        100
    );

    for (let i = 0; i < count; i++) {

        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.6 + 0.2
        });

    }
}

function animateParticles() {

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    particles.forEach((particle, index) => {

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // 画面外に出たら反対側へ
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.x > window.innerWidth) particle.x = 0;

        if (particle.y < 0) particle.y = window.innerHeight;
        if (particle.y > window.innerHeight) particle.y = 0;

        // 粒子を描画
        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(0, 217, 255, ${particle.alpha})`;

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#00d9ff";

        ctx.fill();

        ctx.shadowBlur = 0;

        // 近くの粒子同士を線でつなぐ
        for (let j = index + 1; j < particles.length; j++) {

            const other = particles[j];

            const dx = particle.x - other.x;
            const dy = particle.y - other.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {

                ctx.beginPath();

                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);

                ctx.strokeStyle =
                    `rgba(0, 217, 255, ${0.12 * (1 - distance / 120)})`;

                ctx.lineWidth = 0.7;
                ctx.stroke();

            }
        }

    });

    requestAnimationFrame(animateParticles);
}


// 初期化
resizeCanvas();
createParticles();
animateParticles();

window.addEventListener("resize", () => {
    resizeCanvas();
    createParticles();
});


// ===============================
// 5. ナビゲーションのスクロール演出
// ===============================

const navigation = document.querySelector(".navigation");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        navigation.style.boxShadow = "0 5px 30px #00000066";
    } else {
        navigation.style.boxShadow = "none";
    }

});
