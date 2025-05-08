class CustomBuyButton extends HTMLElement {
  constructor() {
    super();
    this.gpay = null;
    this.applepay = null;
    this.shoppay = null;
    this.paypal = null;
    this.unbranded = null;
    this.loaded = false;

    this.isPaypalAdded = false
    this.isGpayAdded = false
    this.isApplePayAdded = false
    this.isUnbrandedAdded = false

    // shopify-paypal-button
    // shop-pay-wallet-button -> button element: gravity-button
    // shopify-google-pay-button -> button element: button
    // shopify-apple-pay-button -> button element: button
  }

  connectedCallback() {
    const buyButtonWrapper = document.querySelector('.add-to-cart-with-wishlist');
    if (buyButtonWrapper) {
      const config = { childList: true, subtree: true };
      this.observer = new MutationObserver(this.observeButtonLoad.bind(this));
      this.observer.observe(buyButtonWrapper, config);
    }
    this.button = this.querySelector('button');
    this.button.addEventListener('click', this.handleClick.bind(this));
    
    this.unbrandedContainer = this.querySelector('.unbranded-wrapper')
    this.paypalContainer = this.querySelector('.paypal-wrapper')
    this.gpayContainer = this.querySelector('.gpay-wrapper')
    this.applepayContainer = this.querySelector('.applepay-wrapper')

    document.addEventListener('variant:change', this.onVariantChange.bind(this))
    document.addEventListener('drawerOpen.OptionDrawer', this.safetyCheck.bind(this))
  }

  safetyCheck(e) {
    const buyButtonWrapper = document.querySelector('.add-to-cart-with-wishlist');
    if(this.isUnbrandedAdded || !buyButtonWrapper) {
      return
    }
    const unbranded = buyButtonWrapper.querySelector('shopify-buy-it-now-button')
    if(unbranded) {
      this.unbranded = unbranded
    }

    if(this.unbranded && !this.isUnbrandedAdded) {
      const buyButtonForm = this.unbranded.closest('shopify-accelerated-checkout')
      if(buyButtonForm) {
        this.unbrandedContainer.appendChild(buyButtonForm.cloneNode('deep'))
      }
      this.querySelector('.custom--buy-button').classList.add('hidden')
      this.isUnbrandedAdded = true
    }
  }

  onVariantChange(e) {
    const variant = e.detail.variant
    if(variant.available) {
      this.classList.add('active')
    }
    else {
      this.classList.remove('active')
    }
  }

  observeButtonLoad(mutationsList, observer) {
    mutationsList.forEach(mutation => {
      const gpay = mutation.target.querySelector('shopify-google-pay-button')
      
      if(!this.gpay && gpay) {
        this.gpay = gpay
      }
      if(this.gpay && !this.isGpayAdded) {
        const buyButtonForm = this.gpay.closest('shopify-accelerated-checkout')
        if(buyButtonForm) {
          this.gpayContainer.appendChild(buyButtonForm.cloneNode('deep'))
          this.gpayContainer.classList.add('active')
          this.unbrandedContainer.classList.remove('active')
        }
        observer.disconnect()
        this.querySelector('.custom--buy-button').classList.add('hidden')
        this.isGpayAdded = true
      }

      const paypal = mutation.target.querySelector('shopify-paypal-button')
      if(!this.paypal && paypal) {
        this.paypal = paypal
      }
      if(this.paypal && !this.isPaypalAdded) {
        const buyButtonForm = this.paypal.closest('shopify-accelerated-checkout')
        if(buyButtonForm) {
          this.paypalContainer.appendChild(buyButtonForm.cloneNode('deep'))
          this.paypalContainer.classList.add('active')
          this.unbrandedContainer.classList.remove('active')
        }
        observer.disconnect()
        this.querySelector('.custom--buy-button').classList.add('hidden')
        this.isPaypalAdded = true
      }

      const applepay = mutation.target.querySelector('shopify-apple-pay-button')
      if(!this.applepay && applepay) {
        this.applepay = applepay
      }
      if(this.applepay && !this.isApplePayAdded) {
        const buyButtonForm = this.applepay.closest('shopify-accelerated-checkout')
        if(buyButtonForm) {
          this.applepayContainer.appendChild(buyButtonForm.cloneNode('deep'))
          this.applepayContainer.classList.add('active')
          this.unbrandedContainer.classList.remove('active')
        }
        observer.disconnect()
        this.querySelector('.custom--buy-button').classList.add('hidden')
        this.isApplePayAdded = true
      }
    });
  }

  updateButtonState(svgId, textClass) {
    const svg = this.button.querySelector(`svg#${svgId}`);
    const text = this.button.querySelector(textClass);
    svg.classList.remove('deactive');
    text.classList.add('hidden');
  }

  handleClick(e) {
    e.stopPropagation()
    if (this.applepay) {
      this.applepay.click();
    } else if (this.gpay) {
      this.gpay.click();
    } else if (this.unbranded) {
      this.unbranded.click();
    } else if (this.paypal) {
      this.paypal.click()
      console.log('Paypal clicked')
    }
  }
}

customElements.define('custom-buy-button', CustomBuyButton)

class CustomAddToCart extends HTMLElement {
  constructor() {
    super()
    this.status = {
      loading: false
    };
  }

  connectedCallback() {
    this.button = this.querySelector('button')

    this.button.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick(e) {
    const form = document.querySelector(`form#${e.currentTarget.getAttribute('form')}`)
    if(form) {
      if (this.status.loading) {
        return;
      }

      this.button.classList.add('btn--loading');
    
      this.status.loading = true;
      // form.submit()
      var data = theme.utils.serialize(form);
      fetch(theme.routes.cartAdd, {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(function(data) {
        if (data.status === 422) {
          const error = data
          if (!error.description) {
            console.warn(error);
            return;
          }
    
          var errors = form.querySelector('.errors');
          if (errors) {
            errors.remove();
          }
    
          var errorDiv = document.createElement('div');
          errorDiv.classList.add('errors', 'text-center');
          errorDiv.textContent = error.description;
          form.append(errorDiv);
    
          document.dispatchEvent(new CustomEvent('ajaxProduct:error', {
            detail: {
              errorMessage: error.description
            }
          }));
        } else {
          var product = data;
          document.dispatchEvent(new CustomEvent('ajaxProduct:added', {
            detail: {
              product: product,
              addToCartBtn: this.button
            }
          }));
        }

        this.status.loading = false;
        this.button.classList.remove('btn--loading');
        this.button.classList.add('btn--success');

        setTimeout(() => {
          this.button.classList.remove('btn--success');
          document.dispatchEvent(new CustomEvent('ajaxProduct:added:close-drawer', {
            detail: {}
          }))
        }, 1600)
      }.bind(this));
    }
  }
}

customElements.define('custom-add-to-cart', CustomAddToCart)