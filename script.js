
// ===============================
// 1. スクロールフェードイン
// ===============================

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }

        });

    }, {
        threshold: 0.05,
        rootMargin: "0px 0px 30px 0px"
    });

    revealElements.forEach(element => {
        element.classList.add("prepare");
        observer.observe(element);
    });

}


// ===============================
// 2. スクロール進捗バー
// ===============================

const progressBar = document.getElementById("scrollProgress");

function updateProgress() {

    const scrollTop = window.scrollY;

    const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress =
        scrollHeight > 0
            ? (scrollTop / scrollHeight) * 100
            : 0;

    progressBar.style.width = progress + "%";

}

window.addEventListener("scroll", updateProgress, {
    passive: true
});

updateProgress();


// ===============================
// 3. ナビゲーションの背景変化
// ===============================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        navbar.style.background = "rgba(15, 30, 22, 0.96)";
    } else {
        navbar.style.background = "rgba(17, 34, 26, 0.78)";
    }

}, {
    passive: true
});


// ===============================
// 4. 趣味カードのマウス演出
// ===============================

const hobbyCards = document.querySelectorAll(".hobby-card");

hobbyCards.forEach(card => {

    card.addEventListener("mousemove", event => {

        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateX = (rect.height / 2 - y) / 35;
        const rotateY = (x - rect.width / 2) / 35;

        card.style.transform =
            `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "";

    });

});


// ===============================
// 5. マウス追従の光
// ===============================

if (window.matchMedia("(pointer: fine)").matches) {

    const glow = document.createElement("div");

    glow.className = "mouse-glow";

    document.body.appendChild(glow);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener("mousemove", event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    function animateGlow() {

        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;

        glow.style.left = currentX + "px";
        glow.style.top = currentY + "px";

        requestAnimationFrame(animateGlow);

    }

    animateGlow();

}
