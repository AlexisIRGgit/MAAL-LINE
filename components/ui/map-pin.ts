/** Brand map pin used by both map providers (styles: .maal-map-pin* in globals.css). */
export function createPinElement(label?: string) {
  const el = document.createElement('div')
  el.className = 'maal-map-pin'
  el.innerHTML = `
    <span class="maal-map-pin__pulse"></span>
    <span class="maal-map-pin__dot"></span>
    <span class="maal-map-pin__label"></span>
  `
  // Text content (not innerHTML) so user-entered labels can't inject markup
  setPinLabel(el, label)
  return el
}

export function setPinLabel(pin: HTMLElement, label?: string) {
  const labelEl = pin.querySelector('.maal-map-pin__label')
  if (labelEl) labelEl.textContent = label ?? ''
}
