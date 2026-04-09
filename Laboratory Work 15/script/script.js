class TouristDestination {
    constructor() {
        this.formElement = document.querySelector("[data-js-user-data-form]");
        this.cardsSection = document.querySelector("[data-js-cards-section]");

        this.selectSort = document.querySelector("[data-js-select-sort-price]");
        this.selectSortCountry = document.querySelector("[data-js-select-sort-country]");
        this.btnEditMode = document.querySelector("[data-js-btn-edit-mode]");

        this.cards = [];

        this.flagEditMode = false;
        this.currentEditCard = null;
        this.originalCityName = null;

        this.initialize();
        this.bindEvents();

    }

    initialize() {
        if (localStorage.getItem("location"))
            this.cards = JSON.parse(localStorage.getItem("location"));

        this.renderCards();
        this.setSelectCountry();
    }

    renderCards() {
        this.cardsSection.textContent = "";

        this.cards.forEach(card => {
            this.renderCard(card);
        })
    }

    renderCard(card) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cards-section__card");

        cardElement.innerHTML = this.getTemplateCard(card);
        this.cardsSection.append(cardElement);
    }

    getTemplateCard(card) {
        return `
                <div class="cards-section__delete">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="black"/>
                    </svg>
                </div>
                <div class="cards-section__img">
                    <img src="${card.src}" alt="Snowy mountain peaks">
                </div>
                <div class="cards-section__content">
                    <div class="cards-section__info">
                        <h3 class="cards-section__title">${card.city}</h3>
                        <p class="cards-section__description">${card.description}</p>
                    </div>
                    <div class="cards-section__meta">
                        <h4 class="cards-section__country">${card.country}</h4>
                        <h4 class="cards-section__price">$${card.price} / night</h4>
                    </div>
                </div> 
            `;
    }

    saveLocalStorage() {
        localStorage.setItem("location", JSON.stringify(this.cards));
    }

    setSelectCountry() {
        this.selectSortCountry.textContent = "";

        const country = [ ...new Set(this.cards.map(card => card.country))]
        country.sort();

        this.selectSortCountry.innerHTML = `<option value="all">All</option>`;

        country.forEach(country => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            this.selectSortCountry.append(option);
        })
    }

    sortCards(order) {
        if(order === "all") {
            this.initialize();
            return;
        }

        this.cards.sort((a, b) => {
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);
            if (order === "price-asc") {
                return priceA - priceB;
            }
            if (order === "price-desc") {
                return priceB - priceA;
            }
        });

        this.cards.sort((a, b) => {
            const countryA = a.country.toLowerCase();
            const countryB = b.country.toLowerCase();
            if (order === "name-asc") {
                return countryA.localeCompare(countryB);
            }
            if (order === "name-desc") {
                return countryB.localeCompare(countryA);
            }
        });

        this.renderCards();
    }

    sortCardsByCountry() {
        const selectedCountry = this.selectSortCountry.value;

        const allCards = JSON.parse(localStorage.getItem("location"));

        if (selectedCountry === "all") {
            this.cards = allCards;
        } else {
            this.cards = allCards.filter(card => card.country === selectedCountry);
        }

        this.renderCards();
    }

    deleteThisCard(card) {
        const cardName = card.querySelector(".cards-section__title").textContent.trim();

        this.cards = this.cards.filter(card => card.city !== cardName);

        card.remove();

        this.saveLocalStorage();
    }

    bindEvents() {
        this.formElement.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(this.formElement);
            const data = Object.fromEntries(formData.entries());

            if (Object.values(data).every(value => value.trim() !== "")) {
                if(this.flagEditMode && this.currentEditCard) {
                    this.cards = this.cards.filter(card => card.city !== this.originalCityName);

                    this.currentEditCard.innerHTML = this.getTemplateCard(data);
                    this.currentEditCard = null;
                    this.originalCityName = null;
                }
                else {
                    this.renderCard(data);
                }

                this.cards.push(data);
                this.saveLocalStorage();

                this.formElement.reset();

                this.setSelectCountry();
            }
        })

        this.cardsSection.addEventListener("click", (event) => {
            const currentCard = event.target.closest(".cards-section__card");
            const btnDelete = event.target.closest(".cards-section__delete");

            if (!currentCard) return;

            if (btnDelete) {
                this.deleteThisCard(currentCard);
                return;
            }

            if(!this.flagEditMode ) return;

            if(currentCard) {
                this.currentEditCard = currentCard;

                this.originalCityName = this.currentEditCard.querySelector(".cards-section__title").textContent;
                const data = this.cards.find(card => card.city === this.originalCityName);

                if(data) {
                    Object.keys(data).forEach(key => {
                        const input = this.formElement.elements[key];
                        if(input)
                            input.value = data[key];
                    })
                }
            }

            this.setSelectCountry();
        })

        this.selectSort.addEventListener("change", (event) => {
            event.preventDefault();

            this.sortCards(this.selectSort.value);
        })

        this.selectSortCountry.addEventListener("change", (event) => {
            event.preventDefault();

            this.sortCardsByCountry();
        })

        this.btnEditMode.addEventListener("click", (event) => {
            event.preventDefault();

            this.flagEditMode = !this.flagEditMode;
            this.btnEditMode.classList.toggle("active", this.flagEditMode);

            if(!this.flagEditMode) {
                this.currentEditCard = null;
                this.originalCityName = null;
            }
        })
    }
}

new TouristDestination();