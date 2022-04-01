package com.hcl.springbootecommerce.service;

import com.hcl.springbootecommerce.dto.PaymentInfo;
import com.hcl.springbootecommerce.dto.Purchase;
import com.hcl.springbootecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService  {

     public PurchaseResponse placeOrder(Purchase purchase);

     public void updateInv(Purchase purchase);

     PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;


    
}
