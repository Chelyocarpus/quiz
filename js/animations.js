/**
 * 2026 Animation System
 * ─────────────────────────────────────────────────────
 * Trends implemented:
 *   Micro-Interactions    — ripple, spotlight, magnetic tilt
 *   3D Web Movement       — CSS var–driven perspective tilt on cards
 *   Animated Typography   — feedback text classes, counter roll
 *   Story-Driven Motion   — correct/incorrect card state signaling
 *   Performance-First     — passive listeners, requestAnimationFrame,
 *                           will-change managed dynamically
 *   SVG/Vector Animation  — dark-mode toggle stroke draw trigger
 *   Minimal & Elegant     — restores defaults smoothly on leave
 *   Cross-Platform        — all effects gated on prefers-reduced-motion
 */

const Animations = (() => {
    /* ── Motion preference gate ─────────────────────────── */
    const prefersReduced = () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 3D Card Tilt — activates only while hovering the card ── */
    const MAX_TILT = 2; // degrees — kept subtle

    function initCardTilt() {
        if (prefersReduced()) return;

        // Attach listeners to existing cards and re-attach when new cards appear
        attachCardTiltListeners();

        // Re-scan when the DOM changes (question transitions swap the card content)
        const observer = new MutationObserver(attachCardTiltListeners);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function attachCardTiltListeners() {
        document.querySelectorAll('.card').forEach(card => {
            if (card._tiltBound) return; // already wired
            card._tiltBound = true;

            let rafId = null;

            card.addEventListener('mousemove', e => {
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (card.classList.contains('shake') ||
                        card.classList.contains('correct-answer') ||
                        card.classList.contains('incorrect-answer')) return;

                    const rect = card.getBoundingClientRect();
                    const tiltY = (((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * MAX_TILT).toFixed(2);
                    const tiltX = (((rect.top  + rect.height / 2 - e.clientY) / (rect.height / 2)) * MAX_TILT).toFixed(2);

                    card.style.setProperty('--tilt-x', `${tiltX}deg`);
                    card.style.setProperty('--tilt-y', `${tiltY}deg`);
                    card.style.willChange = 'transform';
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
                card.style.willChange = '';
            }, { passive: true });
        });
    }

    /* ── Button Spotlight — scoped to button hover only ──── */
    function initButtonSpotlight() {
        if (prefersReduced()) return;

        // Use event delegation but only fire the work when inside a button
        document.addEventListener('mousemove', e => {
            const btn = e.target.closest('.button');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            btn.style.setProperty('--btn-spotlight-x', `${(((e.clientX - rect.left) / rect.width)  * 100).toFixed(1)}%`);
            btn.style.setProperty('--btn-spotlight-y', `${(((e.clientY - rect.top)  / rect.height) * 100).toFixed(1)}%`);
        }, { passive: true });
    }

    /* ── Ripple on Click ─────────────────────────────────── */
    function initRipple() {
        document.addEventListener('click', onRippleClick, { passive: true });
    }

    function onRippleClick(e) {
        const btn = e.target.closest('.button');
        if (!btn || prefersReduced()) return;

        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        const x      = e.clientX - rect.left - size / 2;
        const y      = e.clientY - rect.top  - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
        btn.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }

    /* ── Dark-Mode Toggle SVG Spin ────────────────────────── */
    // Adds the animation class alongside the existing onclick — does NOT
    // remove or replace it so toggleDarkMode() continues to work normally.
    function initDarkModeIconSpin() {
        const toggle = document.getElementById('darkModeToggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            if (prefersReduced()) return;
            toggle.classList.remove('transitioning');
            // Force reflow so the animation always restarts
            void toggle.offsetWidth;
            toggle.classList.add('transitioning');
            // Remove class after animation duration (450 ms matches CSS)
            setTimeout(() => toggle.classList.remove('transitioning'), 450);
        }, { passive: true });
    }

    /* ── Feedback Text Animation Classes ─────────────────── */
    function initFeedbackObserver() {
        const feedback = document.getElementById('feedback');
        if (!feedback) return;

        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.type !== 'childList' && m.type !== 'characterData') return;
                const text = feedback.textContent.trim();
                if (!text) return;

                feedback.classList.remove('correct', 'incorrect');
                // Force reflow to restart animation
                void feedback.offsetWidth;

                if (feedback.classList.contains('correct')) {
                    feedback.classList.add('correct');
                } else if (feedback.classList.contains('incorrect')) {
                    feedback.classList.add('incorrect');
                }
            });
        });

        observer.observe(feedback, {
            childList: true,
            subtree:   true,
            characterData: true,
        });
    }

    /* ── Card Answer State Classes ───────────────────────── */
    function initCardStateObserver() {
        // Watch #feedback for class changes to apply card states
        const feedback = document.getElementById('feedback');
        const card     = document.getElementById('questionCard');
        if (!feedback || !card) return;

        const observer = new MutationObserver(() => {
            const isCorrect   = feedback.classList.contains('correct');
            const isIncorrect = feedback.classList.contains('incorrect');

            card.classList.remove('correct-answer', 'incorrect-answer');
            void card.offsetWidth; // reflow

            if (isCorrect)   card.classList.add('correct-answer');
            if (isIncorrect) card.classList.add('incorrect-answer');
        });

        observer.observe(feedback, { attributes: true, attributeFilter: ['class'] });
    }

    /* ── Animated Score Counter ───────────────────────────── */
    /**
     * Smoothly rolls a number element from its current displayed
     * value to the target value.
     * @param {HTMLElement} el  — element containing the number
     * @param {number} target   — end value
     * @param {number} duration — ms
     */
    function animateCounter(el, target, duration = 600) {
        if (!el || prefersReduced()) {
            if (el) el.textContent = target;
            return;
        }

        const start    = parseInt(el.textContent) || 0;
        const range    = target - start;
        const startTs  = performance.now();

        function step(ts) {
            const elapsed  = ts - startTs;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quad
            const eased    = 1 - (1 - progress) * (1 - progress);
            el.textContent = Math.round(start + range * eased);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    /* Expose so quiz engine can call it */
    window.animateCounter = animateCounter;

    /* ── Tab switch stagger override ─────────────────────── */
    /**
     * Re-triggers stagger animation when a tab content becomes active.
     * CSS stagger only fires on first `.active` assignment, so we
     * force a reflow to replay it on every switch.
     */
    function initTabStagger() {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                requestAnimationFrame(() => {
                    const active = document.querySelector('.tab-content.active');
                    if (!active || prefersReduced()) return;
                    // Force reflow on direct children to replay stagger
                    [...active.children].forEach((child, i) => {
                        child.style.animation = 'none';
                        void child.offsetWidth;
                        child.style.animation = '';
                    });
                });
            });
        });
    }

    /* ── Intersection Observer fallback (non-scroll-driven) ─ */
    /**
     * For browsers without scroll-driven animation support,
     * apply the same reveal using IntersectionObserver.
     */
    function initScrollRevealFallback() {
        if (CSS.supports('animation-timeline', 'scroll()')) return; // native supported

        const targets = document.querySelectorAll('.saved-set-item, .term-item, .import-method');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        targets.forEach(el => observer.observe(el));
    }

    /* ── Stagger newly added term items ──────────────────── */
    function staggerNewItem(el) {
        if (prefersReduced()) return;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'stagger-in 0.3s var(--ease-spring) both';
        el.addEventListener('animationend', () => {
            el.style.animation = '';
        }, { once: true });
    }
    window.staggerNewItem = staggerNewItem;
    /* ── Drag-and-Drop File Zone ────────────────────────── */
    function initDropZone() {
        const zone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        if (!zone || !fileInput) return;

        // Click anywhere on zone triggers file picker
        zone.addEventListener('click', e => {
            if (e.target.closest('label')) return; // label already triggers it
            fileInput.click();
        });

        zone.addEventListener('dragenter', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        }, { passive: false });

        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        }, { passive: false });

        zone.addEventListener('dragleave', e => {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('drag-over');
            }
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (!file) return;

            const allowed = ['.json', '.txt'];
            const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowed.includes(ext)) {
                if (typeof ToastSystem !== 'undefined') {
                    ToastSystem.show('Only .json and .txt files are supported.', 'error');
                }
                return;
            }

            showDropFilename(zone, file.name);

            // Trigger the same importWords handler by faking a FileList on the input
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Show selected filename when user picks via browser dialog
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) showDropFilename(zone, file.name);
        });
    }

    function showDropFilename(zone, name) {
        zone.classList.add('drop-accepted');
        setTimeout(() => zone.classList.remove('drop-accepted'), 1000);

        let badge = zone.querySelector('.drop-zone-filename');
        if (!badge) {
            badge = document.createElement('p');
            badge.className = 'drop-zone-filename';
            zone.appendChild(badge);
        }
        // Safe text assignment — no innerHTML with user data
        badge.textContent = '';
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'file-check');
        const text = document.createTextNode(` ${name}`);
        badge.appendChild(icon);
        badge.appendChild(text);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    /* ── Init ────────────────────────────────────────────── */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _init);
        } else {
            _init();
        }
    }

    function _init() {
        initCardTilt();
        initButtonSpotlight();
        initRipple();
        initDarkModeIconSpin();
        initFeedbackObserver();
        initCardStateObserver();
        initTabStagger();
        initScrollRevealFallback();
        initDropZone();
    }

    return { init, animateCounter, staggerNewItem };
})();

Animations.init();
