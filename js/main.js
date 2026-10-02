
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
});



window.addEventListener('load', () => {
  const box = document.getElementById('gravity');
  if (!box) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!window.Matter || reduceMotion) {
    box.classList.add('gravity--static');
    return;
  }

  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;
  let started = false;

  function start() {
    if (started) return;
    started = true;

    let width = box.clientWidth;
    const height = box.clientHeight;
    const wall = 100;

    const engine = Engine.create();
    engine.gravity.y = 0.9;

    const floor = Bodies.rectangle(width / 2, height + wall / 2, 5000, wall, { isStatic: true });
    const leftWall = Bodies.rectangle(-wall / 2, height / 2, wall, height * 4, { isStatic: true });
    const rightWall = Bodies.rectangle(width + wall / 2, height / 2, wall, height * 4, { isStatic: true });
    Composite.add(engine.world, [floor, leftWall, rightWall]);

    const items = [...box.querySelectorAll('.gravity__tag')].map((el, i) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const isSticker = el.classList.contains('gravity__sticker');

      const body = Bodies.rectangle(
        w / 2 + Math.random() * Math.max(width - w, 1),
        -h - i * 80,
        w,
        h,
        {
          chamfer: { radius: isSticker ? 10 : h / 2 - 1 },
          restitution: 0.45,
          friction: 0.3,
          angle: (Math.random() - 0.5) * 0.8
        }
      );

      Composite.add(engine.world, body);
      el.style.visibility = 'visible';
      return { el, body, w, h };
    });

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) {
      const mouse = Mouse.create(box);
      ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((ev) => {
        mouse.element.removeEventListener(ev, mouse.mousewheel);
      });
      const drag = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
      });
      Composite.add(engine.world, drag);
    }

    window.addEventListener('resize', () => {
      width = box.clientWidth;
      Body.setPosition(floor, { x: width / 2, y: height + wall / 2 });
      Body.setPosition(rightWall, { x: width + wall / 2, y: height / 2 });
    });

    function tick() {
      Engine.update(engine, 1000 / 60);
      items.forEach(({ el, body, w, h }) => {
        const { x, y } = body.position;
        el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${body.angle}rad)`;
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      start();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(box);
});
// ===== 3. Мобильное меню =====
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;

  function closeMenu() {
    nav.classList.remove('nav--open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  // Закрываем меню после клика по ссылке и по клавише Esc
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
});
// ===== 4. Копирование почты в один клик =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.querySelector('.contacts__copy');

    button.addEventListener('click', async () => {
      const text = button.dataset.copy;

      try {
        await navigator.clipboard.writeText(text);
        if (label) label.textContent = 'Скопировано ✓';
        setTimeout(() => {
          if (label) label.textContent = 'Скопировать';
        }, 2000);
      } catch (error) {
        // если браузер не дал скопировать — открываем почтовую программу
        window.location.href = `mailto:${text}`;
      }
    });
  });
});