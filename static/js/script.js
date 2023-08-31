document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.getElementById('gallery');
    const overlay = document.getElementById('overlay');
    const overlayImage = overlay.querySelector('img');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const sortSelect = document.getElementById('sortSelect');
    const pageCounter = document.getElementById('pageCounter');
    const firstPageButton = document.getElementById('firstPage');
    const lastPageButton = document.getElementById('lastPage');
    const pageNavigation = document.getElementById('pageNavigation');

    let currentPage = 1;
    let totalPages = 1;
    let sorted = false;
    let isHovered = false;

    function fetchImages(page) {
        let url = `/get_images?page=${page}`;
        if (sorted) {
            url += '&sort=size';
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                gallery.innerHTML = '';
                data.forEach(filename => {
                    const thumbnail = document.createElement('div');
                    thumbnail.classList.add('thumbnail');
                    const img = document.createElement('img');
                    img.src = 'static/screenshots/' + filename;
                    img.loading = 'lazy';
                    thumbnail.appendChild(img);

                    thumbnail.addEventListener('click', () => {
                        overlayImage.src = img.src;
                        overlay.style.display = 'flex';
                    });

                    let hoverTimeout;
                    thumbnail.addEventListener('mouseover', () => {
                        isHovered = true;
                        hoverTimeout = setTimeout(() => {
                            overlayImage.src = img.src;
                            overlay.style.display = 'flex';
                        }, 1000); // Delay in milliseconds
                    });

                    thumbnail.addEventListener('mouseout', () => {
                        clearTimeout(hoverTimeout);
                        isHovered = false;
                        overlay.style.display = 'none';
                    });

                    const name = document.createElement('p');
                    name.textContent = filename;
                    thumbnail.appendChild(name);
                    gallery.appendChild(thumbnail);
                });
                updatePageCounter();
                updatePageNavigation();
            })
            .catch(error => console.error('Error fetching images:', error));
    }

    function updatePageCounter() {
        pageCounter.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    function fetchTotalPages() {
        fetch(`/get_total_pages?sorted=${sorted}`)
            .then(response => response.json())
            .then(data => {
                totalPages = data.total_pages;
                updatePageCounter();
                updatePageNavigation();
            })
            .catch(error => console.error('Error fetching total pages:', error));
    }

    function updatePageNavigation() {
        pageNavigation.innerHTML = '';

        const visiblePages = 5;
        const range = Math.floor(visiblePages / 2);
        const startPage = Math.max(currentPage - range, 1);
        const endPage = Math.min(currentPage + range, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            } else {
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    fetchImages(currentPage);
                });
            }
            pageNavigation.appendChild(pageButton);
        }
    }

    fetchTotalPages();

    fetchImages(currentPage);

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchImages(currentPage);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchImages(currentPage);
        }
    });


    sortSelect.addEventListener('change', () => {
        sorted = sortSelect.value === 'size';
        currentPage = 1;
        fetchTotalPages();
        fetchImages(currentPage);
    });

    firstPageButton.addEventListener('click', () => {
        if (currentPage !== 1) {
            currentPage = 1;
            fetchImages(currentPage);
        }
    });

    lastPageButton.addEventListener('click', () => {
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            fetchImages(currentPage);
        }
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            overlay.style.display = 'none';
        }
    });
});
