
(function () {
  "use strict";

 // ==========================================
// FLOATING PILL NAVIGATION
// ==========================================

const topbar = document.querySelector(".topbar");
const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

// Scroll effect
function updateNavigation() {
    if (!topbar) return;

    topbar.classList.toggle(
        "scrolled",
        window.scrollY > 50
    );
}

window.addEventListener("scroll", updateNavigation, {
    passive: true
});

updateNavigation();

// Mobile menu
if (menuToggle && navigation) {

    menuToggle.addEventListener("click", function () {

        const isOpen = navigation.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";

    });

    navigation.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navigation.classList.remove("open");

            menuToggle.textContent = "☰";

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


  // Experience switching

  const experienceItems = document.querySelectorAll(".experience-item");
  const experienceImage = document.getElementById("experienceImage");
  const experienceTag = document.getElementById("experienceTag");
  const experienceTitle = document.getElementById("experienceTitle");

  const experiences = [
    {
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&auto=format&fit=crop",
      tag: "01 / ABOVE THE CLOUDS",
      title: "Find your<br><em>high ground.</em>"
    },
    {
      image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1800&auto=format&fit=crop",
      tag: "02 / INTO THE WILD",
      title: "Get a little<br><em>closer.</em>"
    },
    {
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&auto=format&fit=crop",
      tag: "03 / FOLLOW THE FLOW",
      title: "Let the world<br><em>slow down.</em>"
    },
    {
      image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=1800&auto=format&fit=crop",
      tag: "04 / UNDER OPEN SKIES",
      title: "Stay out<br><em>there.</em>"
    }
  ];

  function changeExperience(index) {
    const item = experiences[index];

    experienceItems.forEach(function (element, i) {
      element.classList.toggle("active", i === index);
    });

    experienceImage.style.opacity = "0";

    setTimeout(function () {
      experienceImage.src = item.image;
      experienceTag.textContent = item.tag;
      experienceTitle.innerHTML = item.title;

      experienceImage.style.opacity = "1";
    }, 250);
  }

  experienceItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      changeExperience(index);
    });

    item.addEventListener("mouseenter", function () {
      if (window.innerWidth > 650) {
        changeExperience(index);
      }
    });
  });


  // Contact form

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const destination = document.getElementById("destination").value;

    if (!name || !email) {
      formMessage.textContent = "Please complete your name and email.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMessage.textContent = "Please enter a valid email address.";
      return;
    }

    formMessage.textContent =
      "Thank you, " + name + ". Your enquiry is ready for submission.";

    console.log({
      name: name,
      email: email,
      destination: destination
    });

    // Connect this form to your email or CRM backend before launch.
    contactForm.reset();
  });


  // Scroll reveal

  const sections = document.querySelectorAll(
    ".intro, .experience, .destinations, .expedition, .manifesto, .contact"
  );

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });

  }

/* =========================================
   HERO DEPTH — POINTER PARALLAX + SCROLL
========================================= */

var heroScene = document.querySelector('#heroScene');
var heroGlobe = document.querySelector('#heroGlobe');
var hero = document.querySelector('.hero--immersive');

var farMountain = document.querySelector(
  '.hero-scene__mountain--far'
);

var nearMountain = document.querySelector(
  '.hero-scene__mountain--near'
);

var reduceMotion = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroScene && heroGlobe && hero && !reduceMotion) {

  var pointerX = 0;
  var pointerY = 0;
  var scrollProgress = 0;

  var targetX = 0;
  var targetY = 0;
  var sceneFrame = false;

  function updateScene() {

    sceneFrame = false;

    targetX += (pointerX - targetX) * 0.055;
    targetY += (pointerY - targetY) * 0.055;

    var rotateY = -17 + targetX * 7;
    var rotateX = -8 - targetY * 5 + scrollProgress * 5;
    var drift = scrollProgress * 46;

    heroGlobe.style.transform =
      'translate3d(' +
      (targetX * 16) +
      'px,calc(-50% + ' +
      (targetY * 12 + drift) +
      'px),0) rotateX(' +
      rotateX +
      'deg) rotateY(' +
      rotateY +
      'deg)';

    if (farMountain) {
      farMountain.style.transform =
        'translate3d(' +
        (targetX * -10) +
        'px,' +
        (scrollProgress * 18) +
        'px,-80px) scale(1.12)';
    }

    if (nearMountain) {
      nearMountain.style.transform =
        'translate3d(' +
        (targetX * -18) +
        'px,' +
        (scrollProgress * 32) +
        'px,-25px) scale(1.08)';
    }

    if (scrollProgress > 0.9) {
      heroScene.style.opacity = String(
        Math.max(0.35, 1 - (scrollProgress - 0.9) * 3)
      );
    } else {
      heroScene.style.opacity = '1';
    }

    if (
      Math.abs(pointerX - targetX) > 0.002 ||
      Math.abs(pointerY - targetY) > 0.002
    ) {
      requestAnimationFrame(updateScene);
    }
  }

  function queueScene() {
    if (!sceneFrame) {
      sceneFrame = true;
      requestAnimationFrame(updateScene);
    }
  }

  hero.addEventListener('pointermove', function (event) {

    var bounds = hero.getBoundingClientRect();

    pointerX =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

    pointerY =
      ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    queueScene();

  }, { passive: true });

  hero.addEventListener('pointerleave', function () {

    pointerX = 0;
    pointerY = 0;

    queueScene();

  });

  window.addEventListener('scroll', function () {

    var bounds = hero.getBoundingClientRect();

    scrollProgress = Math.max(
      0,
      Math.min(
        1,
        -bounds.top / Math.max(1, bounds.height)
      )
    );

    queueScene();

  }, { passive: true });

  queueScene();
}

})();
