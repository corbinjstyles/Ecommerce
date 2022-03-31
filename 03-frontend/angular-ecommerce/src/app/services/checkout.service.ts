import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrderItem } from '../common/order-item';
import { PaymentInfo } from '../common/payment-info';
import { Product } from '../common/product';
import { Purchase } from '../common/purchase';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {


  private purchaseUrl= environment.HCLTechStoreUrl + '/checkout/purchase';

  private updateUrl= environment.HCLTechStoreUrl +'/product'

  private paymentIntentUrl = environment.HCLTechStoreUrl + '/checkout/payment-intent'


  constructor(private httpClient: HttpClient, private productService: ProductService) { }


  placeOrder(purchase: Purchase): Observable<any>{

    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);

  }
  updateData(orderItems : OrderItem): Observable<any>{

    const searchUrl = `${this.updateUrl}/${orderItems.productId}`;
    return this.updateProducts(searchUrl, orderItems);
  }
  updateProducts(searchUrl: string, orderItems: OrderItem): Observable<any> {
    
    return this.httpClient.patch<Product>(searchUrl, {'unitsInStock': orderItems.quantity });
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any>{
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);

  }
}
