import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[]= [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage = sessionStorage;

  constructor() {
    let data = JSON.parse(this.storage.getItem('cartItems'));

    if(data!=null){
      this.cartItems = data;

      this.computerCartTotals();
    }
  }


  decrementQuanitity(theCartItem: CartItem){
    theCartItem.quantity--;
    theCartItem.unitsInStock++;

    if(theCartItem.quantity === 0){
      this.remove(theCartItem);
    }
    else{
      this.computerCartTotals();

    }

  }
  remove(theCartItem: CartItem) {
    const itemIndex= this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);

      this.computerCartTotals();
    }
  }

  addToCart(theCartItem: CartItem){
    let alreadyExistsInCart: boolean = false;
    let exisitingCartItem: CartItem = undefined;

    if(this.cartItems.length > 0){
      exisitingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
      alreadyExistsInCart = (exisitingCartItem != undefined);

    }
    if(alreadyExistsInCart){
      exisitingCartItem.quantity++;
      exisitingCartItem.unitsInStock--;

    }
    else{
      this.cartItems.push(theCartItem);
    }
    this.computerCartTotals();
  }
  computerCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);

    this.persistCartItems();
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('contents of the cart');
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, subtotalprice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----------');
  }
}
