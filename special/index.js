const birthday = new Date("2025-03-13T00:00:00");
const now = new Date();
const isPast = now >= birthday;

if (isPast) {
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("pinkboard").style.display = "none";
    document.getElementById("main-content").classList.add("show");
  });
}

function getCountdownText() {
  const now = new Date();
  const diff = birthday - now;

  if (diff <= 0) {
    setTimeout(() => {
      document.getElementById("pinkboard").style.opacity = 0;
      document.getElementById("main-content").classList.add("show");
    }, 1000);
    return "00d 00h 00m";
  }

  const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(
    2,
    "0",
  );
  const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(
    2,
    "0",
  );
  const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(
    2,
    "0",
  );
  return `${days}d ${hours}h ${minutes}m`;
}

if (!isPast) {
  // Countdown Heart Animation Setup
  const settings = {
    particles: {
      length: 500,
      duration: 3,
      velocity: 100,
      effect: -0.75,
      size: 30,
    },
  };

  function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function (length) {
    if (typeof length === "undefined") {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };
  Point.prototype.normalize = function () {
    var length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };

  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function (context, image) {
    function ease(t) {
      return --t * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size,
    );
  };

  function ParticlePool(length) {
    this.particles = new Array(length);
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i] = new Particle();
    }
    this.firstActive = 0;
    this.firstFree = 0;
  }
  ParticlePool.prototype.add = function (x, y, dx, dy) {
    this.particles[this.firstFree].initialize(x, y, dx, dy);
    this.firstFree = (this.firstFree + 1) % this.particles.length;
    if (this.firstActive === this.firstFree) {
      this.firstActive = (this.firstActive + 1) % this.particles.length;
    }
  };
  ParticlePool.prototype.update = function (deltaTime) {
    let i = this.firstActive;
    while (i !== this.firstFree) {
      this.particles[i].update(deltaTime);
      if (this.particles[i].age >= settings.particles.duration) {
        this.firstActive = (this.firstActive + 1) % this.particles.length;
      }
      i = (i + 1) % this.particles.length;
    }
  };
  ParticlePool.prototype.draw = function (context, image) {
    let i = this.firstActive;
    while (i !== this.firstFree) {
      this.particles[i].draw(context, image);
      i = (i + 1) % this.particles.length;
    }
  };

  (function (canvas) {
    const ctx = canvas.getContext("2d"),
      particles = new ParticlePool(settings.particles.length),
      particleRate = settings.particles.length / settings.particles.duration;
    let time;

    function pointOnHeart(t) {
      return new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) -
          50 * Math.cos(2 * t) -
          20 * Math.cos(3 * t) -
          10 * Math.cos(4 * t) +
          25,
      );
    }

    const image = (() => {
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d");
      c.width = settings.particles.size;
      c.height = settings.particles.size;

      function to(t) {
        var point = pointOnHeart(t);
        point.x =
          settings.particles.size / 2 +
          (point.x * settings.particles.size) / 350;
        point.y =
          settings.particles.size / 2 -
          (point.y * settings.particles.size) / 350;
        return point;
      }

      ctx.beginPath();
      let t = -Math.PI;
      let point = to(t);
      ctx.moveTo(point.x, point.y);
      while (t < Math.PI) {
        t += 0.01;
        point = to(t);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.fillStyle = "#193a90";
      ctx.fill();

      const img = new Image();
      img.src = c.toDataURL();
      return img;
    })();

    function render() {
      requestAnimationFrame(render);
      const newTime = new Date().getTime() / 1000,
        deltaTime = newTime - (time || newTime);
      time = newTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const amount = particleRate * deltaTime;
      for (let i = 0; i < amount; i++) {
        const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        const dir = pos.clone().length(settings.particles.velocity);
        particles.add(
          canvas.width / 2 + pos.x,
          canvas.height / 2 - pos.y,
          dir.x,
          -dir.y,
        );
      }

      particles.update(deltaTime);
      particles.draw(ctx, image);

      // Countdown text
      ctx.save();
      ctx.font = `${Math.min(canvas.width, canvas.height) * 0.04}px Poppins`;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 20;
      ctx.fillText(getCountdownText(), canvas.width / 2, canvas.height / 2);
      ctx.restore();
    }

    function onResize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    window.onresize = onResize;
    setTimeout(() => {
      onResize();
      setInterval(() => render(), 1000);
    }, 10);
  })(document.getElementById("pinkboard"));
}

function initHeartBackground() {
  const canvas = document.getElementById("heart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const heartPosition = rad => [
    Math.pow(Math.sin(rad), 3),
    -(
      15 * Math.cos(rad) -
      5 * Math.cos(2 * rad) -
      2 * Math.cos(3 * rad) -
      Math.cos(4 * rad)
    ),
  ];
  const scaleAndTranslate = (pos, sx, sy, dx, dy) => [
    dx + pos[0] * sx,
    dy + pos[1] * sy,
  ];

  const rand = Math.random;
  const traceCount = 50;
  let pointsOrigin = [],
    targetPoints = [],
    e = [];
  let time = 0;

  for (let i = 0; i < Math.PI * 2; i += 0.1) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
  }

  let heartPointsCount = pointsOrigin.length;

  const pulse = (kx, ky) => {
    for (let i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + canvas.width / 2,
        ky * pointsOrigin[i][1] + canvas.height / 2,
      ];
    }
  };

  for (let i = 0; i < heartPointsCount; i++) {
    let x = rand() * canvas.width,
      y = rand() * canvas.height;
    e[i] = {
      vx: 0,
      vy: 0,
      R: 2,
      speed: rand() + 5,
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + 0.7,
      f: `hsla(0,${~~(40 * rand() + 60)}%,${~~(60 * rand() + 20)}%,.3)`,
      trace: Array.from({ length: traceCount }, () => ({ x, y })),
    };
  }

  const loop = () => {
    let n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * 0.01;
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let u of e) {
      let q = targetPoints[u.q];
      let dx = u.trace[0].x - q[0];
      let dy = u.trace[0].y - q[1];
      let length = Math.sqrt(dx * dx + dy * dy);
      if (length < 10) {
        if (rand() > 0.95) u.q = ~~(rand() * heartPointsCount);
        else {
          if (rand() > 0.99) u.D *= -1;
          u.q = (u.q + u.D + heartPointsCount) % heartPointsCount;
        }
      }
      u.vx += (-dx / length) * u.speed;
      u.vy += (-dy / length) * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;
      for (let k = 0; k < u.trace.length - 1; k++) {
        let T = u.trace[k],
          N = u.trace[k + 1];
        N.x -= 0.4 * (N.x - T.x);
        N.y -= 0.4 * (N.y - T.y);
      }
      ctx.fillStyle = u.f;
      for (let k = 0; k < u.trace.length; k++) {
        ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
      }
    }
    requestAnimationFrame(loop);
  };

  loop();
}

// Trigger heart animation only when main content is shown
const observer = new MutationObserver(mutationsList => {
  for (const mutation of mutationsList) {
    if (mutation.attributeName === "class") {
      const target = mutation.target;
      if (target.classList.contains("show")) {
        initHeartBackground();
      }
    }
  }
});

const mainContent = document.getElementById("main-content");
if (mainContent) {
  observer.observe(mainContent, { attributes: true });
}

const lines = [
  "HELLO JENNIFER",
  "i'm so proud you're building a beautiful, meaningful life for yourself",
  "take your time to enjoy life, today and everyday",
  "umm do you mind puting garlic in your birthday cake? 🙂         ",
  "or maybe plotting a hard graph to know the right distance to blow out your candle 😂                   ",
  "May God continue to guide your steps and fill your days with peace and joy",
  "To a true treasure of a friend",
  "Happy Birthday",
];

const output = document.getElementById("typed");
async function typeLine(line, speed = 70) {
  return new Promise(resolve => {
    let i = 0;
    output.textContent = "";
    function type() {
      if (i < line.length) {
        output.textContent += line.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => resolve(), 1000);
      }
    }
    type();
  });
}

async function deleteLine(speed = 30) {
  return new Promise(resolve => {
    let text = output.textContent;
    let i = text.length;
    function del() {
      if (i > 0) {
        output.textContent = text.substring(0, --i);
        setTimeout(del, speed);
      } else {
        resolve();
      }
    }
    del();
  });
}

async function startTypingSequence() {
  for (let i = 0; i < lines.length; i++) {
    await typeLine(lines[i]);

    // On the last line "I love you", do NOT delete
    if (i === lines.length - 1) {
      setTimeout(showSlideshow, 1500); // slight pause before showing gallery
    } else {
      await deleteLine();
    }
  }
}

function showSlideshow() {
  const now = new Date();

  if (now < birthday) return; // do nothing if it's not birthday yet

  const slideshow = document.getElementById("slideshow");
  const gallery = document.getElementById("gallery");
  if (!slideshow || !gallery) return;

  slideshow.style.display = "flex";

  const images = slideshow.querySelectorAll("img");
  let index = 0;

  function nextImage() {
    images[index].classList.remove("active");
    index++;

    if (index < images.length) {
      images[index].classList.add("active");
    } else {
      setTimeout(() => {
        slideshow.style.display = "none";
        gallery.style.display = "flex";
      }, 1000);
      clearInterval(slideshowInterval);
    }
  }

  const slideshowInterval = setInterval(nextImage, 4000);
}

document.addEventListener("DOMContentLoaded", startTypingSequence);

document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const toggleBtn = document.getElementById("toggle-music");

  // Force autoplay on first click due to browser restrictions
  document.body.addEventListener(
    "click",
    () => {
      if (music.paused) music.play();
    },
    { once: true },
  );

  // Toggle button logic
  toggleBtn.addEventListener("click", () => {
    if (music.paused) {
      music.play();
      toggleBtn.textContent = "🔊";
    } else {
      music.pause();
      toggleBtn.textContent = "🔇";
    }
  });
});
