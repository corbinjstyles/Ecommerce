package com.hcl.springbootecommerce.service;

import com.hcl.springbootecommerce.dto.Purchase;
import com.hcl.springbootecommerce.dto.PurchaseResponse;

public interface CheckoutService  {

     public PurchaseResponse placeOrder(Purchase purchase);


    
}
