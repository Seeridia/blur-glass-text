document.addEventListener('DOMContentLoaded', () => {
    const demoComponent = document.getElementById('interactive-demo');
    let currentMode = 'clock';
    let clockInterval;

    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const customTextGroup = document.getElementById('custom-text-group');
    const customTextInput = document.getElementById('custom-text-input');
    const fontFamilySelect = document.getElementById('font-family-select');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentMode = button.dataset.mode;

            if (currentMode === 'clock') {
                customTextGroup.classList.add('hidden');
                startClock();
            } else {
                customTextGroup.classList.remove('hidden');
                stopClock();
                customTextInput.focus();
                updateCustomText();
            }
        });
    });

    customTextInput.addEventListener('input', updateCustomText);
    fontFamilySelect.addEventListener('change', updateFontFamily);

    function updateCustomText() {
        if (currentMode === 'custom') {
            const text = customTextInput.value.trim() || 'Glass Text';
            demoComponent.textContent = text;
        }
        updateCodeDisplay();
    }

    function updateFontFamily() {
        if (currentMode === 'custom') {
            const fontFamily = fontFamilySelect.value;
            demoComponent.setAttribute('font-family', fontFamily);
        }
        updateCodeDisplay();
    }

    function updateClock() {
        if (currentMode !== 'clock' || !demoComponent) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        demoComponent.textContent = `${hours}:${minutes}`;
    }

    function startClock() {
        stopClock();
        updateClock();
        clockInterval = setInterval(updateClock, 1000);
    }

    function stopClock() {
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    }

    function setupSliderControl(sliderId, valueDisplayId, attributeName, unit = '', fixed = 0) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueDisplayId);

        if (!slider || !valueDisplay) return;

        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            valueDisplay.textContent = `${value.toFixed(fixed)}${unit}`;
            const attributeValue = unit === '%' ? `${value}%` : value;
            demoComponent.setAttribute(attributeName, attributeValue);
            updateCodeDisplay();
        });
    }

    setupSliderControl('blur-slider', 'blur-value', 'blur', 'px');
    setupSliderControl('brightness-slider', 'brightness-value', 'brightness', '', 2);
    setupSliderControl('fontsize-slider', 'fontsize-value', 'font-size', 'px');
    setupSliderControl('text-x-slider', 'text-x-value', 'text-x', '%');
    setupSliderControl('text-y-slider', 'text-y-value', 'text-y', '%');

    const imageButtons = document.querySelectorAll('.image-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadInput = document.getElementById('upload-input');

    imageButtons.forEach(button => {
        button.addEventListener('click', () => {
            imageButtons.forEach(btn => btn.classList.remove('active'));
            uploadBtn.classList.remove('active');
            button.classList.add('active');

            const newImageSrc = button.dataset.src;
            demoComponent.setAttribute('image-src', newImageSrc);
            updateCodeDisplay();
        });
    });

    // 处理图片上传
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 切换到上传的图片
                imageButtons.forEach(btn => btn.classList.remove('active'));
                uploadBtn.classList.add('active');

                // 设置新的背景图片
                demoComponent.setAttribute('image-src', e.target.result);
                updateCodeDisplay();
            };
            reader.readAsDataURL(file);
        }
    });

    startClock();

    // 代码生成和复制功能
    const codeDisplay = document.getElementById('code-display');
    const copyCodeBtn = document.getElementById('copy-code-btn');

    function updateCodeDisplay() {
        const imageSrc = demoComponent.getAttribute('image-src');
        const blur = demoComponent.getAttribute('blur');
        const brightness = demoComponent.getAttribute('brightness');
        const fontSize = demoComponent.getAttribute('font-size');
        const fontWeight = demoComponent.getAttribute('font-weight');
        const fontFamily = demoComponent.getAttribute('font-family');
        const textX = demoComponent.getAttribute('text-x');
        const textY = demoComponent.getAttribute('text-y');
        const textContent = demoComponent.textContent;

        // 获取图片文件名（如果是本地文件）
        let displayImageSrc = imageSrc;
        if (imageSrc && !imageSrc.startsWith('data:')) {
            displayImageSrc = imageSrc.includes('/') ? imageSrc.split('/').pop() : imageSrc;
        } else if (imageSrc && imageSrc.startsWith('data:')) {
            displayImageSrc = 'uploaded-image.jpg';
        }

        const codeLines = [];
        codeLines.push('<span class="tag">&lt;glass-text</span>');
        
        if (displayImageSrc) {
            codeLines.push(`  <span class="attr-name">image-src</span>=<span class="attr-value">"${displayImageSrc}"</span>`);
        }
        if (blur !== '10') {
            codeLines.push(`  <span class="attr-name">blur</span>=<span class="attr-value">"${blur}"</span>`);
        }
        if (brightness !== '0.8') {
            codeLines.push(`  <span class="attr-name">brightness</span>=<span class="attr-value">"${brightness}"</span>`);
        }
        if (fontSize !== '100px') {
            codeLines.push(`  <span class="attr-name">font-size</span>=<span class="attr-value">"${fontSize}"</span>`);
        }
        if (fontWeight !== '700') {
            codeLines.push(`  <span class="attr-name">font-weight</span>=<span class="attr-value">"${fontWeight}"</span>`);
        }
        if (fontFamily !== 'sans-serif') {
            codeLines.push(`  <span class="attr-name">font-family</span>=<span class="attr-value">"${fontFamily}"</span>`);
        }
        if (textX !== '50%') {
            codeLines.push(`  <span class="attr-name">text-x</span>=<span class="attr-value">"${textX}"</span>`);
        }
        if (textY !== '50%') {
            codeLines.push(`  <span class="attr-name">text-y</span>=<span class="attr-value">"${textY}"</span>`);
        }

        codeLines.push('<span class="tag">&gt;</span>');
        codeLines.push(`  <span class="text-content">${textContent}</span>`);
        codeLines.push('<span class="tag">&lt;/glass-text&gt;</span>');

        codeDisplay.innerHTML = codeLines.join('\n');
    }

    function getPlainTextCode() {
        const imageSrc = demoComponent.getAttribute('image-src');
        const blur = demoComponent.getAttribute('blur');
        const brightness = demoComponent.getAttribute('brightness');
        const fontSize = demoComponent.getAttribute('font-size');
        const fontWeight = demoComponent.getAttribute('font-weight');
        const fontFamily = demoComponent.getAttribute('font-family');
        const textX = demoComponent.getAttribute('text-x');
        const textY = demoComponent.getAttribute('text-y');
        const textContent = demoComponent.textContent;

        let displayImageSrc = imageSrc;
        if (imageSrc && !imageSrc.startsWith('data:')) {
            displayImageSrc = imageSrc.includes('/') ? imageSrc.split('/').pop() : imageSrc;
        } else if (imageSrc && imageSrc.startsWith('data:')) {
            displayImageSrc = 'uploaded-image.jpg';
        }

        const attributes = [];
        if (displayImageSrc) attributes.push(`image-src="${displayImageSrc}"`);
        if (blur !== '10') attributes.push(`blur="${blur}"`);
        if (brightness !== '0.8') attributes.push(`brightness="${brightness}"`);
        if (fontSize !== '100px') attributes.push(`font-size="${fontSize}"`);
        if (fontWeight !== '700') attributes.push(`font-weight="${fontWeight}"`);
        if (fontFamily !== 'sans-serif') attributes.push(`font-family="${fontFamily}"`);
        if (textX !== '50%') attributes.push(`text-x="${textX}"`);
        if (textY !== '50%') attributes.push(`text-y="${textY}"`);

        if (attributes.length === 0) {
            return `<glass-text>\n  ${textContent}\n</glass-text>`;
        } else {
            return `<glass-text\n  ${attributes.join('\n  ')}\n>\n  ${textContent}\n</glass-text>`;
        }
    }

    copyCodeBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(getPlainTextCode());
            copyCodeBtn.textContent = '已复制';
            copyCodeBtn.classList.add('copied');
            setTimeout(() => {
                copyCodeBtn.textContent = '复制';
                copyCodeBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    });

    // 监听所有可能改变代码的事件
    const observer = new MutationObserver(updateCodeDisplay);
    observer.observe(demoComponent, { 
        attributes: true, 
        childList: true, 
        characterData: true, 
        subtree: true 
    });

    // 初始化代码显示
    updateCodeDisplay();

    window.addEventListener('beforeunload', stopClock);
});
