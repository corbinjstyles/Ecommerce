import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { CartItem } from 'src/app/common/cart-item';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  cartItem: CartItem[] = [];
  storage: Storage = sessionStorage;



  //stripe api
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  isDisabled: boolean = false;


  constructor(private formBuilder: FormBuilder, private luv2ShopFormService: Luv2ShopFormService, private cartService: CartService, private checkoutService: CheckoutService, private router: Router, private products: ProductService) { }

  ngOnInit(): void {

    this.setupStripePaymentForm();

     this.reviewCartDetails();



    const theEmail = JSON.parse(this.storage.getItem('userEmail'));

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      creditCard: this.formBuilder.group({

      }),
    });


    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retreived countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );

this.cartItem = this.cartService.cartItems;

  }
  setupStripePaymentForm() {
    var elements = this.stripe.elements();
    this.cardElement = elements.create('card', { hidePostalCode: true });
    this.cardElement.mount('#card-element');
    this.cardElement.on('change', (event: { complete: any; error: { message: any; }; }) => {
      this.displayError = document.getElementById('card-errors');
      if (event.complete) {
        this.displayError.textContent = "";

      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });

  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        return this.creditCardMonths = data;
      }
    );


    this.luv2ShopFormService.getCrditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
  }


  onSubmit() {
    console.log("handling the submit button");
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;





    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;


    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));


    console.log(`this is cart items ${cartItems}`)

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }
                }
              }
            }, { handActions: false })
            .then((result: { error: { message: any; }; }) => {
              if (result.error) {
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                for(let i= 0; i < orderItems.length; i++ ){
                   this.products.getProduct(orderItems[i].productId).subscribe((result: any)=>
                   console.log(result))
                   this.products.updateProduct(orderItems[i].productId, orderItems[i].quantity).subscribe((result)=>
                   console.log(result))
                }
                this.checkoutService.placeOrder(purchase).subscribe(
                  {
                    next: (response: { orderTrackingNumber: any; }) => {
                      alert(`Your order hase been received. \nOrder tracking number: ${response.orderTrackingNumber}`);

                      this.resetCart();
                      this.isDisabled = false;
                    },
                    error: err => {
                      alert(`There was an error: ${err.message}`);
                      this.isDisabled = false;
                    }
                  })
              }
            },CheckoutComponent.bind(this));
        }
      );

    }else{
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }



  }
  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    this.checkoutFormGroup.reset();



    this.router.navigateByUrl("/products");

  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName')!; }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get CreditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get CreditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get CreditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get CreditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }


  copyShuppingAddressToBillingAddress(event: { target: { checked: any; }; }) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }

  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countrName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`)
    console.log(`${formGroupName} country name: ${countrName}`)

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data =>
        this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data =>
        this.totalQuantity = data
    );
  }

}
