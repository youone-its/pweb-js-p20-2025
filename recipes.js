let allRecipes = [];
let filteredRecipes = [];
let slideshowRecipes = []; 
let displayedRecipes = 0;
let slideIndex = 1; 
const recipesPerPage = 9;
const numSlides = 5; 
let debounceTimer;
let slideshowInterval;

document.addEventListener("DOMContentLoaded", () => {
  const firstName = localStorage.getItem("firstName");

  if (!firstName) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userName").textContent = `Hello, ${firstName}!`;

  fetchRecipes();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);

  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleSearch(e.target.value);
    }, 500);
  });

  document.getElementById("cuisineFilter").addEventListener("change", (e) => {
    handleFilter(e.target.value);
  });

  document.getElementById("showMoreBtn").addEventListener("click", () => {
    displayRecipes();
  });
  
  document.getElementById("prevSlideBtn").addEventListener("click", () => {
    plusSlides(-1);
  });

  document.getElementById("nextSlideBtn").addEventListener("click", () => {
    plusSlides(1);
  });

  const modal = document.getElementById("recipeModal");
  const closeBtn = document.querySelector(".close-modal");

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

async function fetchRecipes() {
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const recipesGrid = document.getElementById("recipesGrid");

  try {
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    recipesGrid.innerHTML = "";

    const response = await fetch("https://dummyjson.com/recipes");

    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    const data = await response.json();
    allRecipes = data.recipes;
    filteredRecipes = [...allRecipes];

    selectSlideshowRecipes();
    renderSlideshow();
    startAutoSlideshow();

    populateCuisineFilter();

    displayedRecipes = 0;
    displayRecipes();

    loadingState.classList.add("hidden");
  } catch (error) {
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
    errorState.textContent = `Error: ${error.message}. Please try refreshing the page.`;
  }
}

function startAutoSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
    
    slideshowInterval = setInterval(() => {
        plusSlides(1);
    }, 4000);
}

function selectSlideshowRecipes() {
  if (allRecipes.length === 0) return;
  
  const shuffled = allRecipes.sort(() => 0.5 - Math.random());
  slideshowRecipes = shuffled.slice(0, numSlides);
}

function renderSlideshow() {
    const slideshowElement = document.getElementById("recipeSlideshow");
    const slideshowInner = document.getElementById("slideshowInner");
    const dotsContainer = document.getElementById("dotsContainer");
    
    if (slideshowRecipes.length === 0) {
        slideshowElement.classList.add("hidden");
        return;
    }

    slideshowElement.classList.remove("hidden");
    slideshowInner.innerHTML = '';
    dotsContainer.innerHTML = '';

    slideshowRecipes.forEach((recipe, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}" class="slide-image">
            <div class="slide-content">
                <h2>${recipe.name}</h2>
                <p>Cuisine: ${recipe.cuisine} | Rating: ${recipe.rating.toFixed(1)} ${generateStars(recipe.rating)}</p>
                <button class="btn-view-recipe" data-recipe-id="${recipe.id}">
                    View Full Recipe
                </button>
            </div>
        `;
        slideshowInner.appendChild(slide);
        
        slide.querySelector('button').addEventListener('click', () => viewRecipeDetail(recipe.id));

        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.addEventListener('click', () => currentSlide(index + 1));
        dotsContainer.appendChild(dot);
    });
    
    showSlides(slideIndex);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");
    const slideshowInner = document.getElementById("slideshowInner");
    
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1 } 
    if (n < 1) { slideIndex = slides.length }
    
    slideshowInner.style.transform = `translateX(-${(slideIndex - 1) * 100}%)`;

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    dots[slideIndex - 1].className += " active";
}

function plusSlides(n) {
  startAutoSlideshow(); 
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  startAutoSlideshow(); 
  showSlides(slideIndex = n);
}

function populateCuisineFilter() {
  const cuisineFilter = document.getElementById("cuisineFilter");
  const cuisines = [...new Set(allRecipes.map((recipe) => recipe.cuisine))];

  cuisines.sort().forEach((cuisine) => {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });
}

function displayRecipes() {
  const recipesGrid = document.getElementById("recipesGrid");
  const showMoreContainer = document.getElementById("showMoreContainer");

  const recipesToShow = filteredRecipes.slice(
    displayedRecipes,
    displayedRecipes + recipesPerPage
  );

  recipesToShow.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    recipesGrid.appendChild(card);
  });

  displayedRecipes += recipesToShow.length;

  if (displayedRecipes >= filteredRecipes.length) {
    showMoreContainer.classList.add("hidden");
  } else {
    showMoreContainer.classList.remove("hidden");
  }
}

function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  const stars = generateStars(recipe.rating);
  const ingredientsPreview =
    recipe.ingredients.slice(0, 3).join(", ") +
    (recipe.ingredients.length > 3 ? "..." : "");

  card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
        <div class="recipe-content">
            <h3 class="recipe-name">${recipe.name}</h3>
            <div class="recipe-meta">
                <span class="meta-item">⏱️ ${
                  recipe.prepTimeMinutes + recipe.cookTimeMinutes
                } min</span>
                <span class="meta-item">🔥 ${recipe.difficulty}</span>
            </div>
            <span class="cuisine-tag">${recipe.cuisine}</span>
            <div class="rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${recipe.rating.toFixed(1)}</span>
            </div>
            <div class="ingredients-preview">
                <h4>Ingredients:</h4>
                <p class="ingredients-list">${ingredientsPreview}</p>
            </div>
            <button class="btn-view-recipe" data-recipe-id="${
              recipe.id
            }">
                View Full Recipe
            </button>
        </div>
    `;

  card.querySelector('.btn-view-recipe').addEventListener('click', () => viewRecipeDetail(recipe.id));

  return card;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += "★";
  }

  if (hasHalfStar) {
    stars += "☆";
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += "☆";
  }

  return stars;
}

function handleSearch(query) {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    filteredRecipes = [...allRecipes];
  } else {
    filteredRecipes = allRecipes.filter((recipe) => {
      return (
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.cuisine.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(searchTerm)
        ) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    });
  }

  const currentCuisine = document.getElementById("cuisineFilter").value;
  if (currentCuisine) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) => recipe.cuisine === currentCuisine
    );
  }

  displayedRecipes = 0;
  document.getElementById("recipesGrid").innerHTML = "";
  displayRecipes();
}

function handleFilter(cuisine) {
  if (!cuisine) {
    filteredRecipes = [...allRecipes];
  } else {
    filteredRecipes = allRecipes.filter((recipe) => recipe.cuisine === cuisine);
  }

  const searchTerm = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      return (
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.cuisine.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(searchTerm)
        ) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    });
  }

  displayedRecipes = 0;
  document.getElementById("recipesGrid").innerHTML = "";
  displayRecipes();
}

function viewRecipeDetail(recipeId) {
  const recipe = allRecipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  const modal = document.getElementById("recipeModal");
  const modalBody = document.getElementById("modalBody");

  const stars = generateStars(recipe.rating);

  modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${recipe.image}" alt="${recipe.name}" class="modal-image">
        </div>
        <div class="modal-body-content">
            <h2 class="modal-title">${recipe.name}</h2>
            <div class="modal-meta">
                <span class="meta-item">⏱️ Prep: ${
                  recipe.prepTimeMinutes
                } min</span>
                <span class="meta-item">🍳 Cook: ${
                  recipe.cookTimeMinutes
                } min</span>
                <span class="meta-item">🔥 ${recipe.difficulty}</span>
                <span class="meta-item">🍽️ Servings: ${recipe.servings}</span>
                <span class="meta-item">🌍 ${recipe.cuisine}</span>
            </div>
            <div class="rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${recipe.rating.toFixed(1)} (${
    recipe.reviewCount
  } reviews)</span>
            </div>
            
            <div class="modal-section">
                <h3>Ingredients</h3>
                <ul>
                    ${recipe.ingredients
                      .map((ing) => `<li>${ing}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Instructions</h3>
                <ul>
                    ${recipe.instructions
                      .map((inst) => `<li>${inst}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Nutrition</h3>
                <p>Calories per serving: <strong>${
                  recipe.caloriesPerServing
                }</strong></p>
            </div>
            
            <div class="modal-section">
                <h3>Tags</h3>
                <div class="tags-container">
                    ${recipe.tags
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
            </div>
            
            <div class="modal-section">
                <h3>Meal Type</h3>
                <div class="tags-container">
                    ${recipe.mealType
                      .map((type) => `<span class="tag">${type}</span>`)
                      .join("")}
                </div>
            </div>
        </div>
    `;

  modal.classList.remove("hidden");
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("firstName");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  }
}