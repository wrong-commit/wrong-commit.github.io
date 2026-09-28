(function () {
    const MIN_SCALE = 1;
    const MAX_SCALE = 8;
    const WHEEL_ZOOM_SPEED = 0.0015;
    const DOUBLE_TAP_MS = 300;
    const CLICK_MOVE_THRESHOLD = 6;

    const container = document.querySelector('#full_page_img_container');
    if (!container) return;

    let img = container.querySelector('.full_page_img');
    if (!img) {
        img = document.createElement('img');
        img.className = 'full_page_img';
        img.alt = '';
        container.appendChild(img);
    }
    img.draggable = false;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isOpen = false;
    let isDragging = false;
    let didPan = false;
    let lastTapTime = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;

    // Touch pinch state
    let pinchTouches = new Map();
    let lastPinchDistance = 0;

    function applyTransform() {
        img.style.transform =
            'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
        container.classList.toggle('is-zoomed', scale > 1.01);
    }

    function clampTranslation() {
        if (scale <= 1.01) {
            translateX = 0;
            translateY = 0;
            return;
        }
        // How far the scaled image extends past the viewport, per axis.
        const scaledW = img.offsetWidth * scale;
        const scaledH = img.offsetHeight * scale;
        const maxX = Math.max(0, (scaledW - container.clientWidth) / 2) + 48;
        const maxY = Math.max(0, (scaledH - container.clientHeight) / 2) + 48;
        translateX = Math.max(-maxX, Math.min(maxX, translateX));
        translateY = Math.max(-maxY, Math.min(maxY, translateY));
    }

    function resetTransform() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    function zoomAt(clientX, clientY, nextScale) {
        const rect = img.getBoundingClientRect();
        const offsetX = clientX - (rect.left + rect.width / 2);
        const offsetY = clientY - (rect.top + rect.height / 2);
        const prev = scale;
        scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
        if (scale === prev) return;

        const ratio = scale / prev;
        translateX = translateX - offsetX * (ratio - 1);
        translateY = translateY - offsetY * (ratio - 1);
        clampTranslation();
        applyTransform();
    }

    function open(src) {
        img.src = src;
        resetTransform();
        container.classList.add('is-open');
        container.style.display = 'flex';
        document.body.classList.add('img_viewer_open');
        isOpen = true;
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        endDrag();
        pinchTouches.clear();
        lastPinchDistance = 0;
        container.classList.remove('is-open', 'is-zoomed');
        container.style.display = 'none';
        document.body.classList.remove('img_viewer_open');
        img.removeAttribute('src');
        resetTransform();
    }

    function startDrag(clientX, clientY) {
        isDragging = true;
        didPan = false;
        dragStartX = clientX;
        dragStartY = clientY;
        dragOriginX = translateX;
        dragOriginY = translateY;
        container.classList.add('is-dragging');
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging) return;
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD) {
            didPan = true;
        }
        translateX = dragOriginX + dx;
        translateY = dragOriginY + dy;
        clampTranslation();
        applyTransform();
    }

    function endDrag() {
        isDragging = false;
        container.classList.remove('is-dragging');
    }

    document.querySelectorAll('.clickable_img').forEach(function (thumb) {
        thumb.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            open(thumb.src);
        });
    });

    // Two-finger trackpad / mouse wheel → zoom only
    container.addEventListener(
        'wheel',
        function (event) {
            if (!isOpen) return;
            event.preventDefault();
            event.stopPropagation();
            var factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED);
            zoomAt(event.clientX, event.clientY, scale * factor);
        },
        { passive: false }
    );

    // Desktop pan: mousedown on image, track on document so moves aren't lost
    img.addEventListener('mousedown', function (event) {
        if (!isOpen || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        if (scale <= 1.01) return;
        startDrag(event.clientX, event.clientY);
    });

    document.addEventListener('mousemove', function (event) {
        if (!isOpen || !isDragging) return;
        event.preventDefault();
        moveDrag(event.clientX, event.clientY);
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        endDrag();
    });

    // Touch: 1 finger pans when zoomed, 2 fingers pinch-zoom
    container.addEventListener(
        'touchstart',
        function (event) {
            if (!isOpen) return;
            for (var i = 0; i < event.changedTouches.length; i++) {
                var t = event.changedTouches[i];
                pinchTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
            }
            if (pinchTouches.size >= 2) {
                endDrag();
                var pts = Array.from(pinchTouches.values());
                lastPinchDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            } else if (pinchTouches.size === 1 && scale > 1.01) {
                var only = event.changedTouches[0];
                startDrag(only.clientX, only.clientY);
            }
        },
        { passive: true }
    );

    container.addEventListener(
        'touchmove',
        function (event) {
            if (!isOpen) return;
            event.preventDefault();

            for (var i = 0; i < event.changedTouches.length; i++) {
                var t = event.changedTouches[i];
                if (pinchTouches.has(t.identifier)) {
                    pinchTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
                }
            }

            if (pinchTouches.size >= 2) {
                var pts = Array.from(pinchTouches.values());
                var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                if (lastPinchDistance > 0) {
                    var midX = (pts[0].x + pts[1].x) / 2;
                    var midY = (pts[0].y + pts[1].y) / 2;
                    zoomAt(midX, midY, scale * (dist / lastPinchDistance));
                    didPan = true;
                }
                lastPinchDistance = dist;
                return;
            }

            if (isDragging && event.changedTouches.length) {
                var touch = event.changedTouches[0];
                moveDrag(touch.clientX, touch.clientY);
            }
        },
        { passive: false }
    );

    function endTouch(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            pinchTouches.delete(event.changedTouches[i].identifier);
        }
        if (pinchTouches.size < 2) {
            lastPinchDistance = 0;
        }
        if (pinchTouches.size === 0) {
            endDrag();
        } else if (pinchTouches.size === 1 && scale > 1.01) {
            var remaining = Array.from(pinchTouches.values())[0];
            startDrag(remaining.x, remaining.y);
        }
    }

    container.addEventListener('touchend', endTouch);
    container.addEventListener('touchcancel', endTouch);

    container.addEventListener('click', function (event) {
        if (!isOpen) return;
        event.stopPropagation();

        if (didPan) {
            didPan = false;
            return;
        }

        var now = Date.now();
        var isDouble = now - lastTapTime < DOUBLE_TAP_MS;
        lastTapTime = now;

        if (isDouble && event.target === img) {
            if (scale > 1.01) {
                resetTransform();
            } else {
                zoomAt(event.clientX, event.clientY, 2.5);
            }
            return;
        }

        if (event.target !== img) {
            close();
            return;
        }

        if (scale <= 1.01) {
            var tapStarted = now;
            setTimeout(function () {
                if (lastTapTime === tapStarted && isOpen && scale <= 1.01) {
                    close();
                }
            }, DOUBLE_TAP_MS);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (!isOpen) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        }
    });
})();
