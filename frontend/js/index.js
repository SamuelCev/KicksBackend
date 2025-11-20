import { aiChatIcon, trashIcon } from './utils/icons.js';
import './utils/chat.js';
import { getRandomProducts } from './utils/auth.js';

// ============================================
// CARGAR PRODUCTOS DESTACADOS DESDE EL BACKEND
// ============================================
async function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featured-products-grid');

    try {
        const { renderProductCards } = await import('../components/product-card.js');

        // Obtener productos aleatorios del backend (máximo 4)
        const response = await getRandomProducts();

        if (response.success) {
            renderProductCards(response.products, productsGrid);
        } else {
            throw new Error(response.error);
        }

    } catch (error) {
        console.error('Error al cargar productos:', error);
        productsGrid.innerHTML = `
            <div class="products-error">
                <p>No se pudieron cargar los productos en este momento.</p>
                <button onclick="loadFeaturedProducts()" class="btn btn-primary">Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// FUNCIONALIDAD DEL CAROUSEL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chatFabIcon').innerHTML = aiChatIcon;
    document.getElementById('chatHeaderIcon').innerHTML = aiChatIcon;
    document.getElementById('clearChat').innerHTML = trashIcon;

    // Cargar productos destacados
    loadFeaturedProducts();
    
    // Carousel
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevBtn = document.querySelector('.carousel-control-prev');
    const nextBtn = document.querySelector('.carousel-control-next');
    let currentSlide = 0;
    let autoplayInterval;

    function showSlide(n) {
      // Remover clase active de todos los slides e indicadores
      slides.forEach(slide => slide.classList.remove('active'));
      indicators.forEach(indicator => indicator.classList.remove('active'));

        // Ajustar el índice si está fuera de rango
        if (n >= slides.length) {
          currentSlide = 0;
        } else if (n < 0) {
          currentSlide = slides.length - 1;
        } else {
          currentSlide = n;
        }

        // Mostrar el slide actual
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

      // Event listeners para los controles
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoplay();
        startAutoplay(); // Reiniciar autoplay
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoplay();
        startAutoplay(); // Reiniciar autoplay
    });

      // Event listeners para los indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          showSlide(index);
          stopAutoplay();
          startAutoplay(); // Reiniciar autoplay
        });
    });

    // Pausar autoplay cuando el mouse está sobre el carousel
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);

    // Soporte para gestos táctiles
    let touchStartX = 0;
    let touchEndX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
          // Swipe left
          nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
          // Swipe right
          prevSlide();
        }
    }

    // Iniciar autoplay
    startAutoplay();
});