/**
 * @file glass-text.js
 * @description 一个 Web Component 组件，用于在图片上创建毛玻璃文字效果。
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; position: relative; overflow: hidden; background-color: #111; }
    .background, .clipped, svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    img { object-fit: cover; }
    .clipped { clip-path: url(#svgTextPath); filter: var(--filter-style, blur(10px) brightness(1.2)); }
    slot { display: none !important; }
  </style>
  <img class="background" src="" alt="背景图">
  <img class="clipped" src="" alt="毛玻璃文字效果图">
  <svg><defs><clipPath id="svgTextPath"><text dominant-baseline="middle" text-anchor="middle"></text></clipPath></defs></svg>
  <slot></slot>
`;


/**
 * @class GlassText
 * @description 一个自定义元素 <glass-text>，用于在背景图上显示带有毛玻璃效果的文字。
 * @element glass-text
 */
class GlassText extends HTMLElement {
  #host;
  #textElement;
  #clippedImage;
  #backgroundImage;
  #observer;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.#host = this.shadowRoot.host;
    this.#textElement = this.shadowRoot.querySelector('text');
    this.#clippedImage = this.shadowRoot.querySelector('.clipped');
    this.#backgroundImage = this.shadowRoot.querySelector('.background');
    this.#observer = new MutationObserver(() => this.#updateTextContent());
  }

  static get observedAttributes() {
    return [
      'image-src', 'blur', 'brightness', 'text-x', 'text-y', 
      'font-size', 'font-weight', 'font-family', 'object-fit'
    ];
  }

  connectedCallback() {
    this.#observer.observe(this, {
        childList: true, characterData: true, subtree: true
    });
    this.#updateImage();
    this.#updateAllStyles();
    this.#updateTextContent();
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'image-src':
        this.#updateImage();
        break;
      case 'blur':
      case 'brightness':
        this.#updateFilter();
        break;
      case 'object-fit':
        this.#updateImageFit();
        break;
      default:
        this.#updateTextStyles();
        break;
    }
  }

  #updateAllStyles() {
    this.#updateImageFit();
    this.#updateFilter();
    this.#updateTextStyles();
  }
  
  #updateImage() {
    const imageSrc = this.getAttribute('image-src') || '';
    this.#backgroundImage.src = imageSrc;
    this.#clippedImage.src = imageSrc;
    this.#adaptContainerToImage(imageSrc);
  }

  /**
   * 根据 blur 和 brightness 属性更新CSS滤镜。
   * @private
   */
  #updateFilter() {
    const rawBlur = this.getAttribute('blur') || '10';
    const blurValue = parseFloat(rawBlur) || 10;

    const brightness = this.getAttribute('brightness') || '0.8';
    
    this.#clippedImage.style.setProperty('--filter-style', `blur(${blurValue}px) brightness(${brightness})`);
  }

  #updateImageFit() {
    const objectFit = this.getAttribute('object-fit') || 'cover';
    this.#backgroundImage.style.objectFit = objectFit;
    this.#clippedImage.style.objectFit = objectFit;
  }
  
  #updateTextStyles() {
    this.#textElement.setAttribute('x', this.getAttribute('text-x') || '50%');
    this.#textElement.setAttribute('y', this.getAttribute('text-y') || '50%');
    this.#textElement.style.fontSize = this.getAttribute('font-size') || '100px';
    this.#textElement.style.fontWeight = this.getAttribute('font-weight') || '700';
    this.#textElement.style.fontFamily = this.getAttribute('font-family') || 'sans-serif';
  }

  #updateTextContent() {
    if (this.#textElement) {
        this.#textElement.textContent = this.textContent.trim();
    }
  }
  
  #adaptContainerToImage(src) {
    if (!src) {
      this.#host.style.paddingTop = '';
      this.#host.style.height = '';
      return;
    }
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      this.#host.style.height = '0';
      this.#host.style.paddingTop = `${aspectRatio * 100}%`;
    };
    img.onerror = () => {
      console.error(`[GlassText] 图片加载失败: ${src}`);
      this.#host.style.paddingTop = '';
    };
    img.src = src;
  }
}

window.customElements.define('glass-text', GlassText);