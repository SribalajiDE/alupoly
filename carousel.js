var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};
function filledCell(cell) {
    return cell !== '' && cell != null;
}
function loadFileData(filename) {
if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
    try {
        var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
        var firstSheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[firstSheetName];

        // Convert sheet to JSON to filter blank rows
        var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
        // Filter out blank rows (rows where all cells are empty, null, or undefined)
        var filteredData = jsonData.filter(row => row.some(filledCell));

        // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
        var headerRowIndex = filteredData.findIndex((row, index) =>
            row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
        );
        // Fallback
        if (headerRowIndex === -1 || headerRowIndex > 25) {
            headerRowIndex = 0;
        }

        // Convert filtered JSON back to CSV
        var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
        csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
        return csv;
    } catch (e) {
        console.error(e);
        return "";
    }
}
return gk_fileData[filename] || "";
}
const grid = document.querySelector('.suitable-for-grid');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');
let isDragging = false;
let startX;
let scrollLeft;
let items = document.querySelectorAll('.suitable-for-item');
const itemWidth = 320; // Width of each item (300px + 20px gap, from CSS)
let totalItems = items.length;

// Clone items for infinite scroll
function setupInfiniteScroll() {
    const firstClone = Array.from(items).map(item => item.cloneNode(true));
    const lastClone = Array.from(items).map(item => item.cloneNode(true));
    firstClone.forEach(clone => grid.appendChild(clone));
    lastClone.forEach(clone => grid.prepend(clone));
    // Update items after cloning
    items = document.querySelectorAll('.suitable-for-item');
    totalItems = items.length;
    // Set initial scroll to middle set of original items
    grid.scrollLeft = (totalItems / 3) * itemWidth;
}

// Initialize infinite scroll
setupInfiniteScroll();

// Check scroll position and reset for infinite loop
function checkScroll() {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    const currentScroll = grid.scrollLeft;
    const middleSet = (totalItems / 3) * itemWidth;

    // Reset to middle when reaching the cloned ends
    if (currentScroll >= maxScroll - itemWidth / 2) {
        grid.scrollLeft = middleSet;
    } else if (currentScroll <= itemWidth / 2) {
        grid.scrollLeft = middleSet + (totalItems / 3) * itemWidth - itemWidth;
    }
}

// Swipe/Drag Functionality
grid.addEventListener('mousedown', startDragging);
grid.addEventListener('touchstart', startDragging, { passive: false });
grid.addEventListener('mousemove', drag);
grid.addEventListener('touchmove', drag, { passive: false });
grid.addEventListener('mouseup', stopDragging);
grid.addEventListener('touchend', stopDragging);
grid.addEventListener('mouseleave', stopDragging);
grid.addEventListener('scroll', checkScroll);

function startDragging(e) {
    isDragging = true;
    grid.style.cursor = 'grabbing';
    grid.style.scrollBehavior = 'auto'; // Disable smooth scrolling during drag
    startX = (e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
    scrollLeft = grid.scrollLeft;
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX);
    const walk = (startX - x) * 1.5; // Adjusted sensitivity for smoother swipe
    grid.scrollLeft = scrollLeft + walk;
}

function stopDragging() {
    if (!isDragging) return;
    isDragging = false;
    grid.style.cursor = 'grab';
    grid.style.scrollBehavior = 'smooth'; // Re-enable smooth scrolling after drag
}

// Navigation Buttons
prevBtn.addEventListener('click', () => {
    grid.scrollBy({ left: -itemWidth, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
    grid.scrollBy({ left: itemWidth, behavior: 'smooth' });
});