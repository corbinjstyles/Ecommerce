import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[]= [];
  totalPrice: number = 0;
  totalQuantity: number = 0;
  product!: Product;

  constructor(private cartService: CartService, private productService: ProductService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }
  getStock(cartItem: CartItem): any{
    this.productService.getProduct(cartItem.id).subscribe((result: Product) =>
   {

      return result.unitsInStock;
   });
  }
  listCartDetails() {

    this.cartItems = this.cartService.cartItems;
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
    this.cartService.computerCartTotals();

  }
  incrementQuanitity(theCartItem: CartItem){
    this.cartService.addToCart(theCartItem);
  }
  decrementQuanitity(theCartItem: CartItem){
    this.cartService.decrementQuanitity(theCartItem);
  }
  remove(theCartItem: CartItem){
    this.cartService.remove(theCartItem);
  }

}
