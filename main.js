(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsapAvailable = typeof gsap !== "undefined";
  var stAvailable = gsapAvailable && typeof ScrollTrigger !== "undefined";

  if (gsapAvailable && stAvailable) {
    gsap.registerPlugin(ScrollTrigger);
  }

  function headerHeight() {
    return header ? header.offsetHeight : 0;
  }

  function smoothScrollToHash(hash) {
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href.length < 2) return;
      var id = href.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      if (header && header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
      smoothScrollToHash(href);
      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    });
  });

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = !header.classList.contains("nav-open");
      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mainNav.querySelectorAll("a").forEach(function (a) {
      if (a.getAttribute("href") && a.getAttribute("href").startsWith("http")) {
        a.addEventListener("click", function () {
          header.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header && header.classList.contains("nav-open")) {
      header.classList.remove("nav-open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* —— GSAP: hero title zoom + gradient loop —— */
  function initHeroTitle() {
    var el = document.getElementById("heroTitle");
    if (!el || !gsapAvailable || prefersReducedMotion) return;
    gsap.set(el, { transformOrigin: "50% 55%", backgroundPosition: "0% 50%" });
    gsap.from(el, {
      scale: 0.78,
      opacity: 0,
      filter: "blur(6px)",
      duration: 1.2,
      ease: "power3.out",
      delay: 0.12,
      clearProps: "filter",
    });
    gsap.to(el, {
      backgroundPosition: "100% 50%",
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  /* —— Particles (glowing dots) —— */
  function initParticles() {
    var canvas = document.getElementById("heroParticles");
    if (!canvas || prefersReducedMotion) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var particles = [];
    var hero = canvas.closest(".hero");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!hero) return;
      var rect = hero.getBoundingClientRect();
      var rw = Math.max(1, rect.width);
      var rh = Math.max(1, rect.height);
      canvas.width = Math.floor(rw * dpr);
      canvas.height = Math.floor(rh * dpr);
      canvas.style.width = rw + "px";
      canvas.style.height = rh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(count) {
      particles.length = 0;
      var w = canvas.clientWidth || 800;
      var h = canvas.clientHeight || 500;
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          a: 0.25 + Math.random() * 0.55,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.02,
        });
      }
    }

    var animId;
    function tick() {
      var w = canvas.offsetWidth || canvas.clientWidth || 800;
      var h = canvas.offsetHeight || canvas.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
        var glow = p.a * (0.75 + 0.25 * Math.sin(p.pulse));
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, "rgba(255, 230, 240, " + glow + ")");
        g.addColorStop(0.35, "rgba(232, 180, 191, " + glow * 0.55 + ")");
        g.addColorStop(1, "rgba(232, 180, 191, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(tick);
    }

    resize();
    spawn(72);
    tick();

    var ro = new ResizeObserver(function () {
      resize();
      spawn(72);
    });
    if (hero) ro.observe(hero);

    window.addEventListener(
      "beforeunload",
      function () {
        cancelAnimationFrame(animId);
        ro.disconnect();
      },
      { once: true }
    );
  }

  /* —— SVG wave motion —— */
  function initWaves() {
    if (!gsapAvailable || prefersReducedMotion) return;
    var back = document.querySelector(".hero-wave--back");
    var front = document.querySelector(".hero-wave--front");
    var pa = document.querySelector(".wave-path--a");
    var pb = document.querySelector(".wave-path--b");
    if (back && pa) {
      gsap.to(pa, {
        y: 18,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(back, {
        x: "-8%",
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (front && pb) {
      gsap.to(pb, {
        y: -12,
        duration: 6.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(front, {
        x: "6%",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }

  /* —— Cursor trail glow —— */
  function initCursorTrail() {
    var host = document.getElementById("cursorTrail");
    if (!host || prefersReducedMotion) return;
    var canvas = document.createElement("canvas");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var points = [];
    var maxPts = 48;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener(
      "mousemove",
      function (e) {
        points.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (points.length > maxPts) points.shift();
      },
      { passive: true }
    );

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < points.length; i++) {
        points[i].life *= 0.92;
      }
      points = points.filter(function (p) {
        return p.life > 0.04;
      });
      for (var j = 0; j < points.length; j++) {
        var p = points[j];
        var alpha = p.life * 0.55;
        var rad = 10 + p.life * 22;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        g.addColorStop(0, "rgba(255, 200, 220, " + alpha + ")");
        g.addColorStop(0.45, "rgba(232, 180, 191, " + alpha * 0.45 + ")");
        g.addColorStop(1, "rgba(232, 180, 191, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* —— Countdown + flip —— */
  function pad(n, len) {
    var s = String(Math.max(0, Math.floor(n)));
    while (s.length < len) s = "0" + s;
    return s;
  }

  function initCountdown() {
    var root = document.getElementById("countdown");
    if (!root) return;
    var target = new Date("2026-05-22T23:59:59+07:00").getTime();
    var units = {
      days: { el: root.querySelector('[data-key="days"] .flip-num'), prev: null, pad: 2 },
      hours: { el: root.querySelector('[data-key="hours"] .flip-num'), prev: null, pad: 2 },
      minutes: { el: root.querySelector('[data-key="minutes"] .flip-num'), prev: null, pad: 2 },
      seconds: { el: root.querySelector('[data-key="seconds"] .flip-num'), prev: null, pad: 2 },
    };

    function flipTo(unit, value) {
      var u = units[unit];
      if (!u || !u.el) return;
      if (unit === "days" && value > 99) u.pad = 3;
      var str = pad(value, u.pad);
      if (u.prev === null) {
        u.el.textContent = str;
        u.prev = str;
        return;
      }
      if (u.prev === str) return;
      u.prev = str;
      if (gsapAvailable && !prefersReducedMotion) {
        gsap
          .timeline()
          .to(u.el, {
            rotateX: -88,
            duration: 0.22,
            ease: "power2.in",
            transformOrigin: "center center",
            onComplete: function () {
              u.el.textContent = str;
            },
          })
          .fromTo(
            u.el,
            { rotateX: 88 },
            { rotateX: 0, duration: 0.26, ease: "power2.out", transformOrigin: "center center" }
          );
      } else {
        u.el.textContent = str;
      }
    }

    function tick() {
      var now = Date.now();
      var diff = Math.max(0, target - now);
      var s = Math.floor(diff / 1000);
      var days = Math.floor(s / 86400);
      var hours = Math.floor((s % 86400) / 3600);
      var minutes = Math.floor((s % 3600) / 60);
      var seconds = s % 60;
      if (days > 99) units.days.pad = 3;
      flipTo("days", days);
      flipTo("hours", hours);
      flipTo("minutes", minutes);
      flipTo("seconds", seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* —— Floating icons —— */
  function initFloatIcons() {
    if (!gsapAvailable || prefersReducedMotion) return;
    document.querySelectorAll(".float-icon").forEach(function (icon) {
      var speed = parseFloat(icon.getAttribute("data-speed")) || 0.4;
      gsap.to(icon, {
        y: 14,
        duration: 2.4 + speed * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: speed * 0.8,
      });
    });
  }

  /* —— Button ripple —— */
  function initRipples() {
    document.querySelectorAll(".btn-ripple").forEach(function (btn) {
      btn.addEventListener(
        "click",
        function (e) {
          var rect = btn.getBoundingClientRect();
          var ripple = document.createElement("span");
          ripple.className = "ripple";
          var size = Math.max(rect.width, rect.height) * 2;
          ripple.style.width = ripple.style.height = size + "px";
          ripple.style.left = e.clientX - rect.left - size / 2 + "px";
          ripple.style.top = e.clientY - rect.top - size / 2 + "px";
          btn.appendChild(ripple);
          if (gsapAvailable && !prefersReducedMotion) {
            gsap.fromTo(
              ripple,
              { scale: 0, opacity: 0.55 },
              { scale: 1, opacity: 0, duration: 0.65, ease: "power2.out", onComplete: function () {
                ripple.remove();
              } }
            );
          } else {
            setTimeout(function () {
              ripple.remove();
            }, 500);
          }
        },
        { passive: true }
      );
    });
  }

  /* —— Masalah section (modular interactive animations) —— */
  var masalahModule = (function () {
    var section = document.getElementById("masalah");
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".problem-item")) : [];
    var numbers = section ? Array.prototype.slice.call(section.querySelectorAll(".problem-number")) : [];
    var miniIcons = section ? Array.prototype.slice.call(section.querySelectorAll(".problem-mini-icon")) : [];

    function initParticles() {
      var canvas = document.getElementById("masalahParticles");
      if (!section || !canvas || prefersReducedMotion) return;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var dots = [];
      var dotCount = Math.min(52, Math.max(24, Math.floor((section.clientWidth || 800) / 18)));
      var rafId;

      function resize() {
        var rect = section.getBoundingClientRect();
        var w = Math.max(1, rect.width);
        var h = Math.max(1, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function seed() {
        dots.length = 0;
        var w = canvas.offsetWidth || 900;
        var h = canvas.offsetHeight || 420;
        for (var i = 0; i < dotCount; i++) {
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.7 + Math.random() * 1.6,
            vx: (Math.random() - 0.5) * 0.11,
            vy: -0.04 - Math.random() * 0.09,
            alpha: 0.22 + Math.random() * 0.28,
          });
        }
      }

      function draw() {
        var w = canvas.offsetWidth || 900;
        var h = canvas.offsetHeight || 420;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < dots.length; i++) {
          var p = dots[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) p.y = h + 8;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, "rgba(250, 246, 240, " + p.alpha + ")");
          g.addColorStop(0.4, "rgba(232, 180, 191, " + p.alpha * 0.55 + ")");
          g.addColorStop(1, "rgba(232, 180, 191, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
      }

      resize();
      seed();
      draw();
      var ro = new ResizeObserver(function () {
        resize();
        seed();
      });
      ro.observe(section);
      window.addEventListener(
        "beforeunload",
        function () {
          cancelAnimationFrame(rafId);
          ro.disconnect();
        },
        { once: true }
      );
    }

    function initEntrance() {
      if (!section || !cards.length || !gsapAvailable || !stAvailable || prefersReducedMotion) return;
      gsap.set(cards, { opacity: 0, y: 36 });
      gsap.set(numbers, { scale: 0.55, boxShadow: "0 0 0 rgba(212, 132, 154, 0)" });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.17,
      }).to(
        numbers,
        {
          scale: 1,
          duration: 0.42,
          ease: "back.out(2.6)",
          boxShadow: "0 0 0 1px rgba(212, 132, 154, 0.28), 0 0 18px rgba(212, 132, 154, 0.28)",
          stagger: 0.17,
        },
        "<0.08"
      );
    }

    function initMiniIconBounce() {
      if (!miniIcons.length || !gsapAvailable || prefersReducedMotion) return;
      miniIcons.forEach(function (icon, index) {
        gsap.to(icon, {
          y: -6,
          duration: 0.65,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 2.35,
          delay: 0.25 * index,
        });
      });
    }

    function init() {
      if (!section) return;
      initParticles();
      initEntrance();
      initMiniIconBounce();
    }

    return { init: init };
  })();

  /* —— Materi section (modular interactive animations) —— */
  var materiModule = (function () {
    var section = document.getElementById("materi");
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".materi-card")) : [];
    var nums = section ? Array.prototype.slice.call(section.querySelectorAll(".materi-num")) : [];
    var titles = section ? Array.prototype.slice.call(section.querySelectorAll(".materi-title")) : [];
    var descs = section ? Array.prototype.slice.call(section.querySelectorAll(".materi-desc")) : [];

    function initParticles() {
      var canvas = document.getElementById("materiParticles");
      if (!section || !canvas || prefersReducedMotion) return;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var dots = [];
      var count = Math.min(56, Math.max(26, Math.floor((section.clientWidth || 900) / 18)));
      var rafId;

      function resize() {
        var rect = section.getBoundingClientRect();
        var w = Math.max(1, rect.width);
        var h = Math.max(1, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function seed() {
        dots.length = 0;
        var w = canvas.offsetWidth || 920;
        var h = canvas.offsetHeight || 420;
        for (var i = 0; i < count; i++) {
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.7 + Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.09,
            vy: -0.03 - Math.random() * 0.08,
            alpha: 0.22 + Math.random() * 0.26,
          });
        }
      }

      function draw() {
        var w = canvas.offsetWidth || 920;
        var h = canvas.offsetHeight || 420;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < dots.length; i++) {
          var p = dots[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) p.y = h + 8;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, "rgba(250, 246, 240, " + p.alpha + ")");
          g.addColorStop(0.4, "rgba(232, 180, 191, " + p.alpha * 0.48 + ")");
          g.addColorStop(1, "rgba(232, 180, 191, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
      }

      resize();
      seed();
      draw();
      var ro = new ResizeObserver(function () {
        resize();
        seed();
      });
      ro.observe(section);
      window.addEventListener(
        "beforeunload",
        function () {
          cancelAnimationFrame(rafId);
          ro.disconnect();
        },
        { once: true }
      );
    }

    function typeTitle(el, text) {
      if (!el) return;
      el.textContent = "";
      var i = 0;
      var speed = 34;
      function step() {
        i += 1;
        el.textContent = text.slice(0, i);
        if (i < text.length) {
          window.setTimeout(step, speed);
        }
      }
      step();
    }

    function initEntrance() {
      if (!section || !cards.length || !gsapAvailable || !stAvailable || prefersReducedMotion) return;
      gsap.set(cards, { opacity: 0, y: 44 });
      gsap.set(nums, { scale: 0.55, boxShadow: "0 0 0 rgba(212, 132, 154, 0)" });
      gsap.set(descs, { opacity: 0, y: 10 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      tl.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.78,
        ease: "power3.out",
        stagger: 0.16,
      }).to(
        nums,
        {
          scale: 1,
          duration: 0.42,
          ease: "back.out(2.4)",
          boxShadow: "0 0 0 1px rgba(212, 132, 154, 0.26), 0 0 18px rgba(212, 132, 154, 0.22)",
          stagger: 0.16,
        },
        "<0.06"
      );

      tl.call(function () {
        titles.forEach(function (title, idx) {
          var source = title.getAttribute("data-text") || title.textContent || "";
          var delay = idx * 260;
          window.setTimeout(function () {
            typeTitle(title, source);
            var desc = descs[idx];
            if (desc) {
              gsap.to(desc, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.35 });
            }
          }, delay);
        });
      });
    }

    function initNumberPulse() {
      if (!nums.length || !gsapAvailable || prefersReducedMotion) return;
      nums.forEach(function (num, index) {
        gsap.to(num, {
          scale: 1.06,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.25 * index + 0.8,
          boxShadow: "0 0 0 1px rgba(212, 132, 154, 0.3), 0 0 20px rgba(212, 132, 154, 0.24)",
        });
      });
    }

    function init() {
      if (!section) return;
      initParticles();
      if (!prefersReducedMotion) {
        titles.forEach(function (title) {
          if (title) title.textContent = "";
        });
      }
      initEntrance();
      initNumberPulse();
    }

    return { init: init };
  })();

  /* —— Benefit section (modular interactive animations) —— */
  var benefitModule = (function () {
    var section = document.getElementById("benefit");
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".benefit-card")) : [];
    var card1 = section ? section.querySelector(".benefit-card--recording") : null;
    var card2 = section ? section.querySelector(".benefit-card--counseling") : null;
    var card3 = section ? section.querySelector(".benefit-card--certificate") : null;
    var icon1 = card1 ? card1.querySelector(".card-icon--recording") : null;
    var icon2 = card2 ? card2.querySelector(".card-icon--headset") : null;
    var icon3 = card3 ? card3.querySelector(".card-icon--certificate") : null;
    var shine = card3 ? card3.querySelector(".icon-shine") : null;

    function initParticles() {
      var canvas = document.getElementById("benefitParticles");
      if (!section || !canvas || prefersReducedMotion) return;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var dots = [];
      var count = Math.min(56, Math.max(24, Math.floor((section.clientWidth || 900) / 18)));
      var rafId;

      function resize() {
        var rect = section.getBoundingClientRect();
        var w = Math.max(1, rect.width);
        var h = Math.max(1, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function seed() {
        dots.length = 0;
        var w = canvas.offsetWidth || 920;
        var h = canvas.offsetHeight || 420;
        for (var i = 0; i < count; i++) {
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.7 + Math.random() * 1.6,
            vx: (Math.random() - 0.5) * 0.1,
            vy: -0.03 - Math.random() * 0.08,
            alpha: 0.22 + Math.random() * 0.26,
          });
        }
      }

      function draw() {
        var w = canvas.offsetWidth || 920;
        var h = canvas.offsetHeight || 420;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < dots.length; i++) {
          var p = dots[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) p.y = h + 8;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, "rgba(250, 246, 240, " + p.alpha + ")");
          g.addColorStop(0.4, "rgba(232, 180, 191, " + p.alpha * 0.5 + ")");
          g.addColorStop(1, "rgba(232, 180, 191, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
      }

      resize();
      seed();
      draw();
      var ro = new ResizeObserver(function () {
        resize();
        seed();
      });
      ro.observe(section);
      window.addEventListener(
        "beforeunload",
        function () {
          cancelAnimationFrame(rafId);
          ro.disconnect();
        },
        { once: true }
      );
    }

    function initEntrance() {
      if (!section || !gsapAvailable || !stAvailable || prefersReducedMotion) return;
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      if (card1) {
        tl.from(card1, {
          x: -70,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.8,
          ease: "power3.out",
          clearProps: "filter",
        });
      }
      if (card2) {
        tl.from(
          card2,
          {
            y: 85,
            scale: 0.86,
            opacity: 0,
            duration: 0.82,
            ease: "back.out(2.1)",
          },
          "-=0.45"
        );
      }
      if (card3) {
        tl.from(
          card3,
          {
            x: 72,
            opacity: 0,
            duration: 0.86,
            ease: "power3.out",
            boxShadow: "0 0 0 rgba(212,132,154,0)",
          },
          "-=0.45"
        ).to(
          card3,
          {
            boxShadow: "0 14px 36px rgba(24, 13, 10, 0.24), 0 0 18px rgba(212,132,154,0.18)",
            duration: 0.5,
            ease: "sine.out",
          },
          "<0.1"
        );
      }
    }

    function initIconLoops() {
      if (!gsapAvailable || prefersReducedMotion) return;
      if (icon1) {
        gsap.to(icon1, {
          rotate: 360,
          duration: 8,
          repeat: -1,
          ease: "none",
        });
      }
      if (icon2) {
        gsap.to(icon2, {
          scale: 1.08,
          boxShadow: "0 0 0 1px rgba(212, 132, 154, 0.28), 0 0 22px rgba(212, 132, 154, 0.26)",
          duration: 1.25,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (shine) {
        gsap.set(shine, { xPercent: -130 });
        gsap.to(shine, {
          xPercent: 260,
          duration: 1.3,
          repeat: -1,
          repeatDelay: 2.6,
          ease: "power1.inOut",
        });
      }
    }

    function init() {
      if (!section) return;
      initParticles();
      initEntrance();
      initIconLoops();
    }

    return { init: init };
  })();

  /* —— Home section extras: parallax + typing —— */
  function initHomeExperience() {
    var section = document.getElementById("home");
    var heroBg = section ? section.querySelector(".hero-bg") : null;
    var typingEl = document.getElementById("heroTyping");
    if (!section) return;

    function typeText(el, text, speed) {
      if (!el || !text) return;
      el.textContent = "";
      var i = 0;
      function step() {
        i += 1;
        el.textContent = text.slice(0, i);
        if (i < text.length) window.setTimeout(step, speed);
      }
      step();
    }

    if (!prefersReducedMotion) {
      if (typingEl) {
        var content = typingEl.getAttribute("data-text") || typingEl.textContent;
        window.setTimeout(function () {
          typeText(typingEl, content, 32);
        }, 460);
      }
      if (gsapAvailable && stAvailable && heroBg) {
        gsap.to(heroBg, {
          y: -48,
          scale: 1.03,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }
    }
  }

  /* —— Narasumber animations —— */
  function initNarasumberExperience() {
    var section = document.getElementById("narasumber");
    if (!section) return;
    var photos = section.querySelectorAll(".speaker-photo");
    var names = section.querySelectorAll(".speaker-name");
    var roles = section.querySelectorAll(".speaker-role");
    var lines = section.querySelectorAll(".speaker-divider");
    var microIcons = section.querySelectorAll(".speaker-micro-icon");
    var shines = section.querySelectorAll(".speaker-photo-shine");

    function initParticles() {
      var canvas = document.getElementById("narasumberParticles");
      if (!canvas || prefersReducedMotion) return;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var dots = [];
      var count = Math.min(52, Math.max(24, Math.floor((section.clientWidth || 900) / 18)));
      var rafId;

      function resize() {
        var rect = section.getBoundingClientRect();
        var w = Math.max(1, rect.width);
        var h = Math.max(1, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function seed() {
        dots.length = 0;
        var w = canvas.offsetWidth || 900;
        var h = canvas.offsetHeight || 420;
        for (var i = 0; i < count; i++) {
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.7 + Math.random() * 1.6,
            vx: (Math.random() - 0.5) * 0.09,
            vy: -0.03 - Math.random() * 0.08,
            alpha: 0.22 + Math.random() * 0.26,
          });
        }
      }

      function draw() {
        var w = canvas.offsetWidth || 900;
        var h = canvas.offsetHeight || 420;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < dots.length; i++) {
          var p = dots[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) p.y = h + 8;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, "rgba(250, 246, 240, " + p.alpha + ")");
          g.addColorStop(0.4, "rgba(232, 180, 191, " + p.alpha * 0.5 + ")");
          g.addColorStop(1, "rgba(232, 180, 191, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
      }

      resize();
      seed();
      draw();
      var ro = new ResizeObserver(function () {
        resize();
        seed();
      });
      ro.observe(section);
      window.addEventListener(
        "beforeunload",
        function () {
          cancelAnimationFrame(rafId);
          ro.disconnect();
        },
        { once: true }
      );
    }

    function initTiltHover() {
      if (prefersReducedMotion || !gsapAvailable) return;
      section.querySelectorAll(".speaker-photo-wrap").forEach(function (wrap) {
        var photo = wrap.querySelector(".speaker-photo");
        if (!photo) return;
        var tiltX = gsap.quickTo(photo, "rotationY", { duration: 0.35, ease: "power2.out" });
        var tiltY = gsap.quickTo(photo, "rotationX", { duration: 0.35, ease: "power2.out" });

        wrap.addEventListener("mousemove", function (e) {
          var rect = wrap.getBoundingClientRect();
          var px = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
          var py = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
          tiltX(px);
          tiltY(py);
        });
        wrap.addEventListener("mouseleave", function () {
          tiltX(0);
          tiltY(0);
        });
      });
    }

    initParticles();
    if (!gsapAvailable || !stAvailable || prefersReducedMotion) return;

    gsap.set(photos, { opacity: 0, scale: 1.12, filter: "blur(14px)" });
    gsap.set(names, { opacity: 0, y: 24, textShadow: "0 0 0 rgba(232,196,200,0)" });
    gsap.set(roles, { opacity: 0, y: 14 });
    gsap.set(lines, { height: 0 });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 76%",
          toggleActions: "play none none none",
          once: true,
        },
      })
      .to(photos, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.2,
      })
      .to(
        lines,
        {
          height: "100%",
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.15,
        },
        "<0.05"
      )
      .to(
        roles,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.2,
        },
        "<0.08"
      )
      .to(
        names,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          textShadow: "0 0 14px rgba(232, 196, 200, 0.34)",
          stagger: 0.2,
        },
        "<0.08"
      );

    microIcons.forEach(function (icon, idx) {
      gsap.to(icon, {
        y: -6,
        duration: 0.7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 2.3,
        delay: idx * 0.3 + 0.2,
      });
    });

    shines.forEach(function (shine, idx) {
      gsap.set(shine, { xPercent: -130 });
      gsap.to(shine, {
        xPercent: 250,
        duration: 1.6,
        repeat: -1,
        repeatDelay: 2.8 + idx * 0.4,
        ease: "power1.inOut",
      });
    });

    initTiltHover();
  }

  /* —— Info + Tutorial progress and tooltips —— */
  function initInfoTutorialExperience() {
    var info = document.getElementById("info");
    var infoTitle = info ? info.querySelector("#infoTitleText") : null;
    var infoTitleLine = info ? info.querySelector(".info-title-line") : null;
    var infoFill = info ? info.querySelector(".info-progress .section-progress-fill") : null;
    var infoCards = info ? info.querySelectorAll(".info-card") : [];
    var infoIcons = info ? info.querySelectorAll(".info-icon") : [];
    var infoDividers = info ? info.querySelectorAll(".info-divider") : [];
    var infoMains = info ? info.querySelectorAll(".info-main") : [];

    function initInfoParticles() {
      var canvas = document.getElementById("infoParticles");
      if (!info || !canvas || prefersReducedMotion) return;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var dots = [];
      var count = Math.min(56, Math.max(24, Math.floor((info.clientWidth || 900) / 18)));
      var rafId;

      function resize() {
        var rect = info.getBoundingClientRect();
        var w = Math.max(1, rect.width);
        var h = Math.max(1, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function seed() {
        dots.length = 0;
        var w = canvas.offsetWidth || 900;
        var h = canvas.offsetHeight || 420;
        for (var i = 0; i < count; i++) {
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.8 + Math.random() * 2.1,
            vx: (Math.random() - 0.5) * 0.08,
            vy: -0.025 - Math.random() * 0.07,
            alpha: 0.2 + Math.random() * 0.28,
          });
        }
      }

      function draw() {
        var w = canvas.offsetWidth || 900;
        var h = canvas.offsetHeight || 420;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < dots.length; i++) {
          var p = dots[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) p.y = h + 8;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
          g.addColorStop(0, "rgba(250, 246, 240, " + p.alpha + ")");
          g.addColorStop(0.45, "rgba(232, 180, 191, " + p.alpha * 0.55 + ")");
          g.addColorStop(1, "rgba(232, 180, 191, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5.6, 0, Math.PI * 2);
          ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
      }

      resize();
      seed();
      draw();
      var ro = new ResizeObserver(function () {
        resize();
        seed();
      });
      ro.observe(info);
      window.addEventListener(
        "beforeunload",
        function () {
          cancelAnimationFrame(rafId);
          ro.disconnect();
        },
        { once: true }
      );
    }

    initInfoParticles();
    if (!gsapAvailable || !stAvailable || prefersReducedMotion) return;

    function typeText(el, source, speed) {
      if (!el || !source) return;
      el.textContent = "";
      var i = 0;
      function step() {
        i += 1;
        el.textContent = source.slice(0, i);
        if (i < source.length) window.setTimeout(step, speed);
      }
      step();
    }

    if (info && infoFill && infoCards.length && infoTitle && infoTitleLine) {
      var titleSource = infoTitle.getAttribute("data-text") || infoTitle.textContent || "";
      gsap.set(infoTitle, { opacity: 0 });
      gsap.set(infoTitleLine, { scaleX: 0 });
      gsap.set(infoCards, { opacity: 0, y: 34 });
      gsap.set(infoIcons, { scale: 0.6, opacity: 0.5 });
      gsap.set(infoDividers, { width: "0%" });
      gsap.set(infoFill, { width: "0%" });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: info,
            start: "top 78%",
            toggleActions: "play none none none",
            once: true,
          },
        })
        .to(infoTitle, { opacity: 1, duration: 0.35, ease: "power2.out" })
        .call(function () {
          typeText(infoTitle, titleSource, 34);
        })
        .to(
          infoTitleLine,
          {
            scaleX: 1,
            duration: 0.55,
            ease: "power2.out",
            boxShadow: "0 0 18px rgba(232, 180, 191, 0.4)",
          },
          "<0.08"
        )
        .to(
          infoCards,
          {
            opacity: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.16,
          },
          "<0.2"
        )
        .to(
          infoDividers,
          {
            width: "100%",
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.16,
          },
          "<0.1"
        )
        .to(
          infoIcons,
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(2.2)",
            stagger: 0.16,
          },
          "<0.1"
        )
        .to(infoFill, { width: "34%", duration: 0.3, ease: "power1.out" })
        .to(infoCards[0], { y: -2, duration: 0.2, ease: "sine.out" }, "<")
        .to(infoFill, { width: "68%", duration: 0.3, ease: "power1.out" })
        .to(infoCards[1], { y: -2, duration: 0.2, ease: "sine.out" }, "<")
        .to(infoFill, { width: "100%", duration: 0.3, ease: "power1.out" })
        .to(infoCards[2], { y: -2, duration: 0.2, ease: "sine.out" }, "<");

      infoCards.forEach(function (card, idx) {
        var heading = card.querySelector("h3");
        var main = card.querySelector(".info-main");
        card.addEventListener("mouseenter", function () {
          gsap.to(card, { boxShadow: "0 18px 40px rgba(24, 13, 10, 0.24), 0 0 0 1px rgba(250, 246, 240, 0.56)", duration: 0.28, overwrite: "auto" });
          if (heading) gsap.to(heading, { scale: 1.035, duration: 0.24, transformOrigin: "left center", overwrite: "auto" });
          if (main) gsap.to(main, { scale: 1.02, color: "#3f2b24", duration: 0.24, transformOrigin: "left center", overwrite: "auto" });
        });
        card.addEventListener("mouseleave", function () {
          gsap.to(card, { boxShadow: "0 10px 30px rgba(24, 13, 10, 0.2)", duration: 0.28, overwrite: "auto" });
          if (heading) gsap.to(heading, { scale: 1, duration: 0.24, overwrite: "auto" });
          if (main) gsap.to(main, { scale: 1, color: "#2a1f1a", duration: 0.24, overwrite: "auto" });
        });

        var icon = infoIcons[idx];
        if (icon) {
          gsap.to(icon, {
            y: -5,
            duration: 0.7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            repeatDelay: 2.2,
            delay: idx * 0.22 + 0.25,
          });
          gsap.to(icon, {
            boxShadow: "0 8px 16px rgba(24, 13, 10, 0.16), 0 0 14px rgba(212, 132, 154, 0.28)",
            duration: 1.1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: idx * 0.2 + 0.2,
          });
        }
      });
    }

    var tutorial = document.getElementById("tutorial");
    var tutorialFill = tutorial ? tutorial.querySelector(".tutorial-progress .section-progress-fill") : null;
    var steps = tutorial ? tutorial.querySelectorAll(".tutorial-steps li") : [];

    if (tutorial && tutorialFill && steps.length) {
      gsap.set(tutorialFill, { width: "0%" });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: tutorial,
            start: "top 78%",
            toggleActions: "play none none none",
            once: true,
          },
        })
        .to(tutorialFill, { width: "33%", duration: 0.3, ease: "power1.out" })
        .to(steps[0], { y: -2, duration: 0.2, ease: "sine.out" }, "<")
        .to(tutorialFill, { width: "66%", duration: 0.3, ease: "power1.out" })
        .to(steps[1], { y: -2, duration: 0.2, ease: "sine.out" }, "<")
        .to(tutorialFill, { width: "100%", duration: 0.3, ease: "power1.out" })
        .to(steps[2], { y: -2, duration: 0.2, ease: "sine.out" }, "<");
    }

    if (info && tutorial) {
      gsap.to("body", {
        backgroundColor: "#faf6f0",
        ease: "none",
        scrollTrigger: {
          trigger: tutorial,
          start: "top 95%",
          end: "top 60%",
          scrub: 0.8,
        },
      });
    }
  }

  /* —— Global section color transitions —— */
  function initSectionColorTransitions() {
    if (!gsapAvailable || !stAvailable || prefersReducedMotion) return;
    var sections = gsap.utils.toArray("main .section");
    sections.forEach(function (section) {
      var color = section.getAttribute("data-bg");
      if (!color) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: function () {
          gsap.to("body", { backgroundColor: color, duration: 0.65, overwrite: "auto" });
        },
        onEnterBack: function () {
          gsap.to("body", { backgroundColor: color, duration: 0.65, overwrite: "auto" });
        },
      });
    });
  }

  /* —— Section fade + parallax —— */
  function initScrollSections() {
    if (!gsapAvailable || !stAvailable || prefersReducedMotion) return;
    gsap.utils.toArray(".section-reveal").forEach(function (section) {
      var inner =
        section.querySelector(".section-reveal-inner") || section.querySelector(".container");
      var speed = parseFloat(section.getAttribute("data-parallax")) || 0.06;
      if (inner) {
        gsap.from(inner, {
          opacity: 0,
          y: 56,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      }
      var shift =
        -(window.innerHeight || 800) * (Number.isFinite(speed) ? speed : 0.06) * 0.38;
      gsap.to(section, {
        y: shift,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.85,
        },
      });
    });
  }

  initHeroTitle();
  initParticles();
  initWaves();
  initCursorTrail();
  initCountdown();
  initHomeExperience();
  initFloatIcons();
  initRipples();
  masalahModule.init();
  materiModule.init();
  benefitModule.init();
  initNarasumberExperience();
  initInfoTutorialExperience();
  initSectionColorTransitions();
  initScrollSections();
})();
