const grid = document.querySelector('.suitable-for-grid');
        const prevButton = document.querySelector('.carousel-prev');
        const nextButton = document.querySelector('.carousel-next');
        const items = document.querySelectorAll('.suitable-for-item');
        const itemCount = items.length;
        let currentIndex = 0;

        function updateCarousel() {
            const itemWidth = items[0].offsetWidth + 16; // Include gap
            grid.style.transform = `translateX(${-currentIndex * itemWidth}px)`;
        }

        function showNext() {
            const visibleItems = getVisibleItems();
            if (currentIndex < itemCount - visibleItems) {
                currentIndex++;
                updateCarousel();
            }
        }

        function showPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }

        function getVisibleItems() {
            return window.innerWidth <= 768 ? 1 : 3;
        }

        prevButton.addEventListener('click', showPrev);
        nextButton.addEventListener('click', showNext);

        window.addEventListener('resize', updateCarousel);

        // Initialize carousel
        updateCarousel();