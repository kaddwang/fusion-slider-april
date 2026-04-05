document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const ENABLE_PASSWORD_LOCK = true; // Set to true to enable password protection

    // Password Protection
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('passwordInput');
    const submitPasswordBtn = document.getElementById('submitPassword');
    const errorMessage = document.getElementById('errorMessage');

    if (!ENABLE_PASSWORD_LOCK) {
        passwordOverlay.style.display = 'none';
    } else {
        const checkPassword = () => {
            const now = new Date();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const correctPassword = `${month}${day}`;
            
            if (passwordInput.value === correctPassword) {
                passwordOverlay.style.opacity = '0';
                setTimeout(() => {
                    passwordOverlay.style.display = 'none';
                }, 500);
            } else {
                errorMessage.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        };

        submitPasswordBtn.addEventListener('click', checkPassword);
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

    // Initialize Highlight.js
    hljs.highlightAll();

    // Get only visible slides (exclude those with display: none)
    const getAllSlides = () => {
        return Array.from(document.querySelectorAll('.slide')).filter(slide => {
            const style = window.getComputedStyle(slide);
            return style.display !== 'none';
        });
    };

    let slides = getAllSlides();
    const indicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;

    // Update Indicator
    const updateIndicator = (index) => {
        slides = getAllSlides(); // Refresh slides list
        indicator.textContent = `${index + 1} / ${slides.length}`;
    };

    // Initialize indicator immediately
    updateIndicator(currentIndex);

    // Scroll to Slide
    const scrollToSlide = (index) => {
        slides = getAllSlides(); // Refresh slides list
        if (index < 0 || index >= slides.length) return;
        slides[index].scrollIntoView({ behavior: 'smooth' });
    };

    // Intersection Observer to track active slide
    const observerOptions = {
        root: document.getElementById('slides-container'),
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Refresh slides list and find index of intersecting slide
                slides = getAllSlides();
                const index = slides.indexOf(entry.target);
                if (index !== -1) {
                    currentIndex = index;
                    updateIndicator(currentIndex);
                }

                // Add visible class for animation
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Only observe visible slides
    slides.forEach(slide => observer.observe(slide));

    // Event Listeners for Buttons
    prevBtn.addEventListener('click', () => scrollToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => scrollToSlide(currentIndex + 1));

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            scrollToSlide(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToSlide(currentIndex - 1);
        }
    });

    // Calculate and update course outline page ranges
    const updateCourseOutline = () => {
        slides = getAllSlides();
        const outlineItems = document.querySelectorAll('.list-group li');
        
        // Find chapter boundaries using data-chapter-start attribute
        const chapterRanges = [];
        // Only calculate ranges for chapters 01-03, Q&A (04) is optional
        const chapterNumbers = ['01', '02', '03'];
        
        chapterNumbers.forEach((chapterNum, idx) => {
            // Find the first slide with data-chapter-start matching this chapter
            let startPage = -1;
            for (let i = 0; i < slides.length; i++) {
                const chapterStart = slides[i].getAttribute('data-chapter-start');
                if (chapterStart === chapterNum) {
                    startPage = i + 1; // 1-based page number
                    break;
                }
            }
            
            // If not found by data-chapter-start, try to find by chapter-badge
            if (startPage === -1) {
                for (let i = 0; i < slides.length; i++) {
                    const badge = slides[i].querySelector('.chapter-badge');
                    if (badge && badge.textContent.trim().startsWith(chapterNum)) {
                        // Check if this is the first occurrence of this chapter badge
                        let isFirst = true;
                        for (let j = 0; j < i; j++) {
                            const prevBadge = slides[j].querySelector('.chapter-badge');
                            if (prevBadge && prevBadge.textContent.trim().startsWith(chapterNum)) {
                                isFirst = false;
                                break;
                            }
                        }
                        if (isFirst) {
                            startPage = i + 1;
                            break;
                        }
                    }
                }
            }
            
            // Find the end page (start of next chapter, or last slide)
            let endPage = slides.length;
            if (idx < chapterNumbers.length - 1) {
                const nextChapterNum = chapterNumbers[idx + 1];
                // First try data-chapter-start
                for (let i = (startPage > 0 ? startPage : 0); i < slides.length; i++) {
                    const chapterStart = slides[i].getAttribute('data-chapter-start');
                    if (chapterStart === nextChapterNum) {
                        endPage = i; // Last page of current chapter
                        break;
                    }
                }
                // If not found, try chapter-badge
                if (endPage === slides.length) {
                    for (let i = (startPage > 0 ? startPage : 0); i < slides.length; i++) {
                        const badge = slides[i].querySelector('.chapter-badge');
                        if (badge && badge.textContent.trim().startsWith(nextChapterNum)) {
                            endPage = i;
                            break;
                        }
                    }
                }
            }
            
            chapterRanges.push({ start: startPage, end: endPage });
        });
        
        // Handle Q&A section (04) - if it exists, it starts after chapter 03 ends
        if (chapterRanges.length >= 3 && chapterRanges[2].end < slides.length) {
            chapterRanges.push({ 
                start: chapterRanges[2].end + 1, 
                end: slides.length 
            });
        } else if (outlineItems.length === 4) {
            // If Q&A is listed but no slides found, mark as N/A
            chapterRanges.push({ start: -1, end: -1 });
        }

        // Update outline items with page ranges
        outlineItems.forEach((item, idx) => {
            if (idx < chapterRanges.length) {
                const range = chapterRanges[idx];
                // Get the original text (number + title)
                const originalHTML = item.innerHTML;
                
                if (range.start > 0 && range.end > 0) {
                    // Check if page range already exists
                    if (!originalHTML.includes('第 ')) {
                        // Add page range after the title
                        const pageRange = ` <span style="color: #666; font-size: 0.85em; font-weight: normal;">(第 ${range.start}-${range.end} 頁)</span>`;
                        item.innerHTML = originalHTML + pageRange;
                    } else {
                        // Update existing page range
                        item.innerHTML = originalHTML.replace(/\(第 \d+-\d+ 頁\)/, `(第 ${range.start}-${range.end} 頁)`);
                    }
                } else if (range.start === -1 && range.end === -1) {
                    // Q&A section without slides - remove or keep as is
                    // Just remove any existing page range
                    item.innerHTML = originalHTML.replace(/\s*\(第 \d+-\d+ 頁\)/, '');
                }
            }
        });
    };

    // Initial check
    slides = getAllSlides();
    if (slides.length > 0) {
        updateIndicator(0);
        slides[0].classList.add('visible');
        // Update course outline after a short delay to ensure DOM is ready
        setTimeout(updateCourseOutline, 100);
    }

    // ============================================
    // 互動特效初始化 (Interactive Effects)
    // ============================================

    // 1. 懸念遮罩 (Spoiler) - 點擊或滑鼠滑過顯示
    document.querySelectorAll('.spoiler').forEach(spoiler => {
        spoiler.addEventListener('click', function() {
            this.classList.add('revealed');
        });
        
        // 滑鼠滑過也顯示（可選）
        spoiler.addEventListener('mouseenter', function() {
            this.classList.add('revealed');
        });
    });

    // 2. 互動按鈕 (Reveal Button) - 點擊顯示結果
    document.querySelectorAll('.btn-reveal').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSelector = this.getAttribute('data-target');
            const targetElement = targetSelector 
                ? document.querySelector(targetSelector) 
                : this.nextElementSibling;
            
            if (targetElement) {
                // 顯示目標內容
                if (targetElement.classList.contains('math-result')) {
                    targetElement.classList.add('revealed');
                } else if (targetElement.classList.contains('hidden-content')) {
                    targetElement.classList.add('revealed');
                }
                
                // 更新按鈕狀態
                this.classList.add('revealed');
                this.textContent = this.getAttribute('data-revealed-text') || '✓ 已顯示';
                this.disabled = true;
            }
        });
    });

    // 3. 終端機模擬 - 打字機效果
    function typeTerminalCommand(element, text, speed = 50) {
        if (!element) return;
        
        element.textContent = '';
        element.style.opacity = '1';
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                // 顯示輸出
                const output = element.parentElement.querySelector('.cmd-output');
                if (output) {
                    setTimeout(() => {
                        output.style.opacity = '1';
                    }, 300);
                }
            }
        }, speed);
    }

    // 初始化終端機動畫（當slide可見時）
    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const terminal = entry.target;
                const cmdInput = terminal.querySelector('.cmd-input');
                const cmdText = cmdInput?.getAttribute('data-cmd');
                
                if (cmdText && !cmdInput.classList.contains('typed')) {
                    cmdInput.classList.add('typed');
                    typeTerminalCommand(cmdInput, cmdText, 30);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.terminal-window').forEach(terminal => {
        terminalObserver.observe(terminal);
    });

    // 4. 極光卡片 - 自動應用 card-shine 類別（可選）
    // 如果需要，可以自動為特定卡片添加 card-shine 類別
    // document.querySelectorAll('.card.highlight').forEach(card => {
    //     card.classList.add('card-shine');
    // });

    // Security: monitor removal of password overlay and clear sensitive content
    const secureClear = () => {
        const slidesContainer = document.getElementById('slides-container');
        const navControls = document.querySelector('.nav-controls');
        const pageIndicator = document.getElementById('pageIndicator');

        if (slidesContainer) {
            slidesContainer.innerHTML = '';
            slidesContainer.style.display = 'none';
        }
        if (navControls) {
            navControls.innerHTML = '';
            navControls.style.display = 'none';
        }
        if (pageIndicator) {
            pageIndicator.textContent = '';
            pageIndicator.style.display = 'none';
        }

        // Replace document with a neutral protected message to avoid exposing content
        try {
            document.documentElement.innerHTML = '<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div><h2>內容無法顯示</h2><p>不是這樣直接刪吧哥，頁面已被保護。</p></div></body>';
        } catch (e) {
            while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
            const msg = document.createElement('div');
            msg.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100vh;margin:0;';
            msg.innerHTML = '<div><h2>內容無法顯示</h2><p>不是這樣直接刪吧哥，頁面已被保護。</p></div>';
            document.body.appendChild(msg);
        }
    };

    (function () {
        const checkOverlayExists = () => !!document.getElementById('password-overlay');

        // If overlay is already missing on load and locking is enabled, clear immediately
        if (!checkOverlayExists() && typeof ENABLE_PASSWORD_LOCK !== 'undefined' && ENABLE_PASSWORD_LOCK) {
            secureClear();
            return;
        }

        const observer = new MutationObserver(() => {
            if (typeof ENABLE_PASSWORD_LOCK !== 'undefined' && ENABLE_PASSWORD_LOCK && !checkOverlayExists()) {
                secureClear();
                observer.disconnect();
            }
        });

        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

        // Extra periodic sanity check as a fallback
        const intervalId = setInterval(() => {
            if (typeof ENABLE_PASSWORD_LOCK !== 'undefined' && ENABLE_PASSWORD_LOCK && !checkOverlayExists()) {
                clearInterval(intervalId);
                secureClear();
            }
        }, 1000);
    })();
});
