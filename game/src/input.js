// Keyboard and mouse state. The game reads this each frame; the
// input layer only records what is held, pressed, or clicked.
export function createInput(canvas) {
  const input = {
    keys: new Set(),
    pressed: new Set(),
    mouse: { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 },
    canvas,
  };
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) input.pressed.add(event.key.toLowerCase());
    input.keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', () => {
    input.keys.clear();
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    input.mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.clickX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    input.mouse.clickY = ((event.clientY - rect.top) / rect.height) * canvas.height;
    input.mouse.clicked = true;
  });
  return input;
}

export function keyHeld(input, ...keys) {
  return keys.some((key) => input.keys.has(key));
}

export function keyPressed(input, ...keys) {
  return keys.some((key) => input.pressed.has(key));
}

// True on the frame any movement key is first pressed — handy for
// waking audio on the first real input.
export function anyMovementPressed(input) {
  return keyPressed(input, 'w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright');
}

export function endFrameInput(input) {
  input.pressed.clear();
  input.mouse.clicked = false;
}
