
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
        speed: 0.12,
        mouse: 0.3
    },
    {
        element: document.querySelector(".depth-middle"),
        speed: 0.25,
        mouse: 0.6
    },
    {
        element: document.querySelector(".depth-front"),
        speed: 0.4,
        mouse: 1
    }
];


/* ==============================
   スクロール表示
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
        {
            threshold: 0.12
        }
    );

    revealElements.forEach(element => {
        element.classList.add("prepare");
        revealObserver.observe(element);
    });
}


/* ==============================
   スクロール進行バー
============================== */

const progressBar = document.getElementById("scrollProgress");

function updateProgressBar() {

    const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollable > 0
        ? (window.scrollY / scrollable) * 100
        : 0;

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }

}


/* ==============================
   ナビゲーションの背景
============================== */

const navbar = document.querySelector(".navbar");

function updateNavbar() {

    if (!navbar) return;

    navbar.classList.toggle(
        "scrolled",
        window.scrollY > 50
    );

}


/* ==============================
   マウスで森の視点を動かす
============================== */

let targetMouseX = 0;
let targetMouseY = 0;

let currentMouseX = 0;
let currentMouseY = 0;

if (hero && !reducedMotion) {

    hero.addEventListener("mousemove", event => {

        const rect = hero.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        targetMouseX = (0.5 - x) * 24;
        targetMouseY = (0.5 - y) * 16;

    });

    hero.addEventListener("mouseleave", () => {
        targetMouseX = 0;
        targetMouseY = 0;
    });

}


/* ==============================
   スクロールによる奥行き
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


/* ==============================
   朝・昼・夕方・夜の色
============================== */

const timeColors = [
    {
        position: 0,
        daylight: [145, 175, 190],
        sunlight: [175, 205, 210]
    },
    {
        position: 0.33,
        daylight: [210, 220, 175],
        sunlight: [230, 220, 150]
    },
    {
        position: 0.68,
        daylight: [225, 150, 95],
        sunlight: [240, 165, 90]
    },
    {
        position: 1,
        daylight: [20, 35, 55],
        sunlight: [65, 80, 100]
    }
];

function interpolateColor(start, end, amount) {

    return start.map((value, index) => {
        return Math.round(
            value + (end[index] - value) * amount
        );
    });

}

function getTimeColors(progress) {

    for (let i = 0; i < timeColors.length - 1; i++) {

        const start = timeColors[i];
        const end = timeColors[i + 1];

        if (
            progress >= start.position &&
            progress <= end.position
        ) {

            const amount =
                (progress - start.position) /
                (end.position - start.position);

            return {
                daylight: interpolateColor(
                    start.daylight,
                    end.daylight,
                    amount
                ),
                sunlight: interpolateColor(
                    start.sunlight,
                    end.sunlight,
                    amount
                )
            };

        }

    }

    return {
        daylight: timeColors[3].daylight,
        sunlight: timeColors[3].sunlight
    };

}

let nightProgress = 0;

function updateDaylight() {

    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = maxScroll > 0
        ? Math.max(0, Math.min(1, window.scrollY / maxScroll))
        : 0;

    const colors = getTimeColors(progress);

    const [r, g, b] = colors.daylight;
    const [sr, sg, sb] = colors.sunlight;

    const daylightAlpha = 0.10 + progress * 0.15;
    const sunlightAlpha = 0.16 * (1 - progress * 0.75);

    document.documentElement.style.setProperty(
        "--daylight-color",
        `rgba(${r}, ${g}, ${b}, ${daylightAlpha})`
    );

    document.documentElement.style.setProperty(
        "--sunlight-glow",
        `rgba(${sr}, ${sg}, ${sb}, ${sunlightAlpha})`
    );

    // 68%から夜へ移行し、88%で夜になる
    nightProgress = Math.max(
        0,
        Math.min(1, (progress - 0.68) / 0.20)
    );

    document.body.classList.toggle(
        "night-mode",
        nightProgress > 0.05
    );

}


/* ==============================
   森の動きを滑らかにする
============================== */

function animateForest() {

    currentMouseX +=
        (targetMouseX - currentMouseX) * 0.04;

    currentMouseY +=
        (targetMouseY - currentMouseY) * 0.04;

    currentScroll +=
        (targetScroll - currentScroll) * 0.08;

    if (background) {

        background.style.transform =
            `translate3d(
                ${currentMouseX * 0.25}px,
                ${currentMouseY * 0.25}px,
                0
            ) scale(1.12)`;

    }

    forestLayers.forEach(layer => {

        if (!layer.element) return;

        const mouseX = currentMouseX * layer.mouse;
        const mouseY = currentMouseY * layer.mouse;
        const scrollY = -currentScroll * layer.speed;

        layer.element.style.transform =
            `translate3d(
                ${mouseX}px,
                ${mouseY + scrollY}px,
                0
            ) scale(${layer.speed === 0.12 ? 1.1 :
                      layer.speed === 0.25 ? 1.12 : 1.15})`;

    });

    requestAnimationFrame(animateForest);

}


/* ==============================
   ホタル
============================== */

const fireflyCanvas = document.getElementById("fireflies");
const fireflyCtx = fireflyCanvas
    ? fireflyCanvas.getContext("2d")
    : null;

let fireflies = [];
let fireflyFrame = 0;

function createFireflies() {

    if (!fireflyCanvas || !fireflyCtx) return;

    const count = Math.min(
        Math.floor(window.innerWidth / 18),
        65
    );

    fireflies = [];

    for (let i = 0; i < count; i++) {

        fireflies.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 1.5 + 1,
            speedX: (Math.random() - 0.5) * 0.35,
            speedY: (Math.random() - 0.5) * 0.3,
            phase: Math.random() * Math.PI * 2,
            glow: Math.random() * 0.5 + 0.5
        });

    }

}

function resizeFireflies() {

    if (!fireflyCanvas || !fireflyCtx) return;

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    fireflyCanvas.width = window.innerWidth * dpr;
    fireflyCanvas.height = window.innerHeight * dpr;

    fireflyCanvas.style.width = `${window.innerWidth}px`;
    fireflyCanvas.style.height = `${window.innerHeight}px`;

    fireflyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createFireflies();

}

function animateFireflies() {

    if (!fireflyCtx || !fireflyCanvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    fireflyCtx.clearRect(0, 0, width, height);

    if (nightProgress > 0) {

        fireflyFrame += 0.015;

        fireflies.forEach(fly => {

            fly.x += fly.speedX;
            fly.y += fly.speedY;

            if (fly.x < -10) fly.x = width + 10;
            if (fly.x > width + 10) fly.x = -10;
            if (fly.y < -10) fly.y = height + 10;
            if (fly.y > height + 10) fly.y = -10;

            const pulse =
                (Math.sin(fireflyFrame + fly.phase) + 1) / 2;

            const alpha =
                nightProgress *
                fly.glow *
                (0.25 + pulse * 0.75);

            const gradient = fireflyCtx.createRadialGradient(
                fly.x,
                fly.y,
                0,
                fly.x,
                fly.y,
                fly.size * 7
            );

            gradient.addColorStop(
                0,
                `rgba(220, 255, 170, ${alpha})`
            );

            gradient.addColorStop(
                0.3,
                `rgba(180, 235, 120, ${alpha * 0.5})`
            );

            gradient.addColorStop(
                1,
                "rgba(180, 235, 120, 0)"
            );

            fireflyCtx.beginPath();
            fireflyCtx.fillStyle = gradient;

            fireflyCtx.arc(
                fly.x,
                fly.y,
                fly.size * 7,
                0,
                Math.PI * 2
            );

            fireflyCtx.fill();

            fireflyCtx.beginPath();

            fireflyCtx.fillStyle =
                `rgba(235, 255, 190, ${alpha})`;

            fireflyCtx.arc(
                fly.x,
                fly.y,
                fly.size,
                0,
                Math.PI * 2
            );

            fireflyCtx.fill();

        });

    }

    requestAnimationFrame(animateFireflies);

}


/* ==============================
   イベント登録と起動
============================== */

window.addEventListener("scroll", () => {

    updateProgressBar();
    updateNavbar();
    updateScrollTarget();
    updateDaylight();

}, { passive: true });

window.addEventListener("resize", () => {
    updateScrollTarget();
    updateDaylight();
    resizeFireflies();
});

updateProgressBar();
updateNavbar();
updateScrollTarget();
updateDaylight();
resizeFireflies();

if (!reducedMotion) {
    animateForest();
    animateFireflies();
}
