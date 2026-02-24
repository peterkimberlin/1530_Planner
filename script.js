document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const mainTabs = document.querySelectorAll('.main-tabs .tab-btn');
    const mainContents = document.querySelectorAll('.tab-content');
    const subTabs = document.querySelectorAll('.sub-tabs .sub-tab-btn');
    const floorImgs = document.querySelectorAll('.floor-img');
    const floorOptions = document.querySelectorAll('.floor-options');

    const exteriorRadios = document.querySelectorAll('input[name="exterior"]');
    const upgradeCheckboxes = document.querySelectorAll('.upgrade-item');
    const upgradeQtyInputs = document.querySelectorAll('.upgrade-item-qty');

    window.updateQty = function (id, change) {
        const input = document.getElementById(id);
        if (!input) return;
        let current = parseInt(input.value) || 0;
        let min = parseInt(input.min) || 0;
        let max = parseInt(input.max) || 20;
        let newVal = current + change;
        if (newVal >= min && newVal <= max) {
            input.value = newVal;
            input.dispatchEvent(new Event('change'));
        }
    };

    const grandTotalEl = document.getElementById('grand-total');
    const subtotalEl = document.getElementById('floor-subtotal-val');
    const exteriorPreview = document.getElementById('exterior-preview');
    const exteriorPreviewWrapper = document.getElementById('exterior-preview-wrapper');

    // Calculation Tab Elements
    const calcExteriorName = document.getElementById('calc-exterior-name');
    const calcExteriorCost = document.getElementById('calc-exterior-cost');
    const calcFloor1Cost = document.getElementById('calc-floor1-cost');
    const calcFloor2Cost = document.getElementById('calc-floor2-cost');
    const calcSummaryTotal = document.getElementById('calc-summary-total');

    // Utility to format number as currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate totals and update UI
    const updateCalculator = () => {
        let totalCost = 0;
        let activeFloorSubtotal = 0;

        // 1. Process Exterior Selection
        const selectedExterior = document.querySelector('input[name="exterior"]:checked');
        if (selectedExterior) {
            const exteriorCost = parseInt(selectedExterior.value || 0);
            totalCost += exteriorCost;

            calcExteriorName.textContent = selectedExterior.dataset.title;
            calcExteriorCost.textContent = formatCurrency(exteriorCost);

            // Update preview image gracefully
            const imgSrc = selectedExterior.dataset.img;
            if (imgSrc) {
                // Fade out, change source, fade in
                exteriorPreview.style.opacity = 0;
                setTimeout(() => {
                    exteriorPreview.src = imgSrc;
                    exteriorPreview.style.opacity = 1;
                    exteriorPreviewWrapper.classList.add('has-selection');
                }, 200);
            } else {
                exteriorPreview.style.opacity = 0;
                setTimeout(() => {
                    exteriorPreview.src = 'assets/rusty_before.jpg';
                    exteriorPreview.style.opacity = 1;
                    exteriorPreviewWrapper.classList.remove('has-selection');
                }, 200);
            }
        }

        // 2. Process Floor Upgrades
        // Find which floor is currently active to compute its specific subtotal
        const activeFloorBtn = document.querySelector('.sub-tabs .sub-tab-btn.active');
        const activeFloorId = activeFloorBtn ? activeFloorBtn.dataset.target : 'floor1';
        const activeFloorContainer = document.getElementById(activeFloorId + '-options');

        let floor1Total = 0;
        let floor2Total = 0;

        const floor1Checkboxes = document.getElementById('floor1-options').querySelectorAll('.upgrade-item');
        floor1Checkboxes.forEach(cb => {
            if (cb.checked) {
                const val = parseInt(cb.value);
                floor1Total += val;
                totalCost += val;
                if (activeFloorId === 'floor1') activeFloorSubtotal += val;
            }
        });

        const floor2Checkboxes = document.getElementById('floor2-options').querySelectorAll('.upgrade-item');
        floor2Checkboxes.forEach(cb => {
            if (cb.checked) {
                const val = parseInt(cb.value);
                floor2Total += val;
                totalCost += val;
                if (activeFloorId === 'floor2') activeFloorSubtotal += val;
            }
        });

        const floor2QtyInputs = document.getElementById('floor2-options').querySelectorAll('.upgrade-item-qty');
        floor2QtyInputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            if (qty > 0) {
                const price = parseInt(input.dataset.price) || 0;
                const val = qty * price;
                floor2Total += val;
                totalCost += val;
                if (activeFloorId === 'floor2') activeFloorSubtotal += val;
            }
        });

        // 3. Update DOM with animation effect
        animateValue(grandTotalEl, totalCost);
        subtotalEl.textContent = formatCurrency(activeFloorSubtotal);

        // Update Calculation Tab
        calcFloor1Cost.textContent = formatCurrency(floor1Total);
        calcFloor2Cost.textContent = formatCurrency(floor2Total);
        calcSummaryTotal.textContent = formatCurrency(totalCost);
    };

    // Animate number counting up/down
    const animateValue = (obj, end) => {
        const currentValStr = obj.textContent.replace(/[^0-9.-]+/g, "");
        const start = parseInt(currentValStr) || 0;

        if (start === end) return;

        const duration = 500;
        const range = end - start;
        let current = start;
        const increment = end > start ? Math.ceil(range / 15) : Math.floor(range / 15);
        const stepTime = Math.abs(Math.floor(duration / (range / increment)));

        const timer = setInterval(() => {
            current += increment;

            // Reached or passed end?
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);

                // Add pop animation
                obj.style.transform = 'scale(1.1)';
                setTimeout(() => { obj.style.transform = 'scale(1)'; }, 150);
            }

            obj.textContent = formatCurrency(current);
        }, stepTime < 10 ? 10 : stepTime);
    };

    // Setup Tab Switching
    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            mainTabs.forEach(t => t.classList.remove('active'));
            mainContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subTabs.forEach(t => t.classList.remove('active'));
            floorImgs.forEach(img => img.classList.remove('active'));
            floorOptions.forEach(opt => opt.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.target + '-img').classList.add('active');
            document.getElementById(tab.dataset.target + '-options').classList.add('active');

            // Recalculate to update the floor subtotal for the newly visible floor
            updateCalculator();
        });
    });

    // Event Listeners for inputs
    exteriorRadios.forEach(radio => radio.addEventListener('change', updateCalculator));
    upgradeCheckboxes.forEach(cb => cb.addEventListener('change', updateCalculator));
    upgradeQtyInputs.forEach(input => input.addEventListener('change', updateCalculator));

    // Initialize
    exteriorPreview.style.transition = 'opacity 0.2s ease-in-out';
    grandTotalEl.style.transition = 'transform 0.15s ease-out';
    grandTotalEl.style.display = 'inline-block';

    updateCalculator();

    // Image Zoom Modal Logic
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".close-modal");
    const zoomableImages = document.querySelectorAll('.zoomable');

    zoomableImages.forEach(img => {
        img.addEventListener('click', function () {
            modal.style.display = "flex";
            // trigger reflow
            void modal.offsetWidth;
            modal.classList.add('show');
            modalImg.src = this.src;
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = "none";
        }, 300); // match CSS transition duration
    };

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
