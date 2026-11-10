/* ==============================
   初期設定
============================== */

document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const hero = document.querySelector(".hero");
const background = document.querySelector(".hero-background");

const forestLayers = [
    {
        element: document.querySelector(".depth-back"),
        scrollSpeed: 0.12,
        mouseSpeed: 0.3,
        scale: 1.10
    },
    {
        element: document.querySelector(".depth-middle"),
        scrollSpeed: 0.25,
        mouseSpeed: 0.6,
        scale: 1.12
    },
    {
        element: document.querySelector(".depth-front"),
        scrollSpeed: 0.4,
        mouseSpeed: 1,
        scale: 1.15
    }
];


/* ==============================
   スクロール時に要素を表示
============================== */

const revealElements = document.querySelectorAll(".reveal");

if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach(element => {
        element.classList.add("prepare");
        revealObserver.observe(element);
    });
}


/* ==============================
   スクロール進行バーとナビゲーション
============================== */

const progressBar = document.getElementById("scrollProgress");
const navbar = document.querySelector(".navbar");

function getPageProgress() {
    const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

    if (scrollable <= 0) return 0;

    return Math.max(0, Math.min(1, window.scrollY / scrollable));
}

function updateProgressAndNavbar() {
    const progress = getPageProgress();

    if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
    }

    if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    }
}


/* ==============================
   マウスで森の視点を動かす
============================== */

let targetMouseX = 0;
let targetMouseY = 0;
let currentMouseX = 0;
let currentMouseY = 0;

const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

if (hero && !reducedMotion && hasFinePointer) {
    hero.addEventListener("pointermove", event => {
        const rect = hero.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        targetMouseX = (0.5 - x) * 24;
        targetMouseY = (0.5 - y) * 16;
    });

    hero.addEventListener("pointerleave", () => {
        targetMouseX = 0;
        targetMouseY = 0;
    });
}


/* ==============================
   スクロールによる森の奥行き
============================== */

let targetScroll = 0;
let currentScroll = 0;

function updateScrollTarget() {
    if (!hero) return;

    const rect = hero.getBoundingClientRect();

    targetScroll = Math.max(
        0,
        Math.min(-rect.top, hero.offsetHeight)
    );
}

function animateForest() {
    currentMouseX += (targetMouseX - currentMouseX) * 0.045;
    currentMouseY += (targetMouseY - currentMouseY) * 0.045;
    currentScroll += (targetScroll - currentScroll) * 0.08;

    if (background) {
        background.style.transform =
            `translate3d(${currentMouseX * 0.25}px, ${currentMouseY * 0.25}px, 0) scale(1.12)`;
    }

    forestLayers.forEach(layer => {
        if (!layer.element) return;

        const mouseX = currentMouseX * layer.mouseSpeed;
        const mouseY = currentMouseY * layer.mouseSpeed;
        const scrollY = -currentScroll * layer.scrollSpeed;

        layer.element.style.transform =
            `translate3d(${mouseX}px, ${mouseY + scrollY}px, 0) scale(${layer.scale})`;
    });

    requestAnimationFrame(animateForest);
}


/* ==============================
   朝・昼・夕方・夜の色変化
   ページ全体のスクロール量に連動
============================== */

const timeColors = [
    {
        position: 0,
        daylight: [145, 175, 190],
        sunlight: [175, 205, 210],
        fireflies: 0
    },
    {
        position: 0.30,
        daylight: [210, 220, 175],
        sunlight: [230, 220, 150],
        fireflies: 0
    },
    {
        position: 0.58,
        daylight: [225, 150, 95],
        sunlight: [240, 165, 90],
        fireflies: 0.25
    },
    {
        position: 0.82,
        daylight: [20, 35, 55],
        sunlight: [65, 80, 100],
        fireflies: 1
    },
    {
        position: 1,
        daylight: [12, 24, 40],
        sunlight: [35, 50, 70],
        fireflies: 1
    }
];

function interpolateNumber(start, end, amount) {
    return start + (end - start) * amount;
}

function interpolateColor(start, end, amount) {
    return start.map((value, index) =>
        Math.round(interpolateNumber(value, end[index], amount))
    );
}

function getTimeColors(progress) {
    for (let i = 0; i < timeColors.length - 1; i++) {
        const start = timeColors[i];
        const end = timeColors[i + 1];

        if (progress >= start.position && progress <= end.position) {
            const amount =
                (progress - start.position) /
                (end.position - start.position);

            return {
                daylight: interpolateColor(start.daylight, end.daylight, amount),
                sunlight: interpolateColor(start.sunlight, end.sunlight, amount),
                fireflies: interpolateNumber(start.fireflies, end.fireflies, amount)
            };
        }
    }

    return timeColors[timeColors.length - 1];
}

let nightProgress = 0;

function updateDaylight() {
    const progress = getPageProgress();
    const colors = getTimeColors(progress);

    const [r, g, b] = colors.daylight;
    const [sr, sg, sb] = colors.sunlight;

    // 時間帯に応じてページ全体の色を変える
    const daylightAlpha = 0.12 + progress * 0.12;
    const sunlightAlpha = 0.15 * (1 - progress * 0.78);

    document.documentElement.style.setProperty(
        "--daylight-color",
        `rgba(${r}, ${g}, ${b}, ${daylightAlpha})`
    );

    document.documentElement.style.setProperty(
        "--sunlight-glow",
        `rgba(${sr}, ${sg}, ${sb}, ${sunlightAlpha})`
    );

    // 夕方からホタルが現れ、夜に向けて明るくなる
    nightProgress = colors.fireflies;

    document.documentElement.style.setProperty(
        "--firefly-opacity",
        String(nightProgress)
    );

    document.body.classList.toggle("night-mode", nightProgress > 0.05);
}


/* ==============================
   ホタルの描画
============================== */

const canvas = document.getElementById("fireflies");
const context = canvas ? canvas.getContext("2d") : null;

let fireflies = [];
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;

function createFireflies() {
    if (!canvas || !context) return;

    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.floor(canvasWidth * pixelRatio);
    canvas.height = Math.floor(canvasHeight * pixelRatio);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const isSmallScreen = window.innerWidth < 680;
    const count = isSmallScreen ? 18 : 38;

    fireflies = Array.from({ length: count }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        radius: Math.random() * 1.8 + 0.8,
        speedX: (Math.random() - 0.5) * 0.28,
        speedY: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.018 + 0.008
    }));
}

function drawFireflies() {
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    if (nightProgress > 0.01) {
        fireflies.forEach(firefly => {
            firefly.x += firefly.speedX;
            firefly.y += firefly.speedY;
            firefly.phase += firefly.pulseSpeed;

            if (firefly.x < -10) firefly.x = canvasWidth + 10;
            if (firefly.x > canvasWidth + 10) firefly.x = -10;
            if (firefly.y < -10) firefly.y = canvasHeight + 10;
            if (firefly.y > canvasHeight + 10) firefly.y = -10;

            const pulse = (Math.sin(firefly.phase) + 1) / 2;
            const alpha = (0.18 + pulse * 0.65) * nightProgress;

            context.beginPath();
            context.arc(
                firefly.x,
                firefly.y,
                firefly.radius * (0.8 + pulse * 0.5),
                0,
                Math.PI * 2
            );
            context.fillStyle = `rgba(220, 245, 150, ${alpha})`;
            context.shadowBlur = 12;
            context.shadowColor = `rgba(190, 235, 120, ${alpha})`;
            context.fill();
        });

        context.shadowBlur = 0;
    }

    requestAnimationFrame(drawFireflies);
}


/* ==============================
   イベントと初期化
============================== */

let scrollTicking = false;

function handleScroll() {
    if (scrollTicking) return;

    scrollTicking = true;

    requestAnimationFrame(() => {
        updateProgressAndNavbar();
        updateScrollTarget();
        updateDaylight();
        scrollTicking = false;
    });
}

window.addEventListener("scroll", handleScroll, { passive: true });

window.addEventListener("resize", () => {
    updateScrollTarget();
    updateDaylight();
    createFireflies();
});

updateProgressAndNavbar();
updateScrollTarget();
updateDaylight();
createFireflies();

if (!reducedMotion) {
    requestAnimationFrame(animateForest);
    requestAnimationFrame(drawFireflies);
}
