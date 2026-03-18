class CurrencyConverter {
    selectors = {
        form: "[data-js-currency-converter]",
        toCurrency: "#to-currency",
        fromCurrency: "#from-currency",
        toAmount: "#to-amount",
        fromAmount: "#from-amount",

        exchangeToBase: "[data-js-to-rate-base]",
        exchangeToUnit: "[data-js-to-rate-unit]",
        exchangeFromBase: "[data-js-from-rate-base]",
        exchangeFromUnit: "[data-js-from-rate-unit]",

        btnCurrencySwitch: "[data-js-btn-currency-switch]",
    }

    constructor() {
        this.formElement = document.querySelector(this.selectors.form);

        this.toCurrencyElement = this.formElement.querySelector(this.selectors.toCurrency);
        this.fromCurrencyElement = this.formElement.querySelector(this.selectors.fromCurrency);
        this.toAmountElement = this.formElement.querySelector(this.selectors.toAmount);
        this.converterResult = this.formElement.querySelector(this.selectors.fromAmount);

        this.exchangeToBase = this.formElement.querySelector(this.selectors.exchangeToBase);
        this.exchangeToUnit = this.formElement.querySelector(this.selectors.exchangeToUnit);
        this.exchangeFromBase = this.formElement.querySelector(this.selectors.exchangeFromBase);
        this.exchangeFromUnit = this.formElement.querySelector(this.selectors.exchangeFromUnit);

        this.btnCurrencySwitch = this.formElement.querySelector(this.selectors.btnCurrencySwitch);

        this.exchangeRates = {
            MDL: 1,
            USD: 0.05757,
            EUR: 0.04967,
            RON: 0.25575,
            GBP: 0.04331,
            CHF: 0.04557,
            UAH: 2.51200,
        }

        this.updateConverter();
        this.switchCurrency();
    }

    currencyConverter(toAmount, toCurrency, fromCurrency) {
        if (isNaN(toAmount) || !toAmount) return "0.00";

        let amount = toAmount / this.exchangeRates[toCurrency];
        return (amount * this.exchangeRates[fromCurrency]).toFixed(2);
    }

    updateConverter() {
        this.formElement.addEventListener('input', (event) => {
            let target = event.target;

            if (target.closest(".form-group") && target.closest("form")) {
                const toAmount = Number(this.toAmountElement.value);
                const toCurrency = this.toCurrencyElement.value;
                const fromCurrency = this.fromCurrencyElement.value;

                this.converterResult.value = this.currencyConverter(toAmount, toCurrency, fromCurrency);

                this.updateRateDisplay(toCurrency, fromCurrency);
            }
        });
    }

    updateRateDisplay(toUnit, fromUnit) {
        this.exchangeToBase.textContent = "1";
        this.exchangeToUnit.textContent = toUnit;
        this.exchangeFromBase.textContent = (1 / this.exchangeRates[toUnit] * this.exchangeRates[fromUnit]).toFixed(2);
        this.exchangeFromUnit.textContent = fromUnit;
    }

    switchCurrency() {
        this.btnCurrencySwitch.addEventListener('click', (event) => {
            event.preventDefault();
            let toCurrency = this.toCurrencyElement.value;
            this.toCurrencyElement.value = this.fromCurrencyElement.value;
            this.fromCurrencyElement.value = toCurrency;

            this.toCurrencyElement.dispatchEvent(new Event('input', {bubbles: true}));
        })
    }

}

new CurrencyConverter();