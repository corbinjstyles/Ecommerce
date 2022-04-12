package com.hcl.springbootecommerce.controller;

import com.hcl.springbootecommerce.dto.PaymentInfo;
import com.hcl.springbootecommerce.dto.Purchase;
import com.hcl.springbootecommerce.dto.PurchaseResponse;
import com.hcl.springbootecommerce.service.CheckoutService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j2;

@Log4j2
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    public CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService){
        this.checkoutService = checkoutService;
    }

    @PostMapping("/purchase")
    public PurchaseResponse placeOrder(@RequestBody Purchase purchase){

        PurchaseResponse purchaseResponse = checkoutService.placeOrder(purchase);
        
        // logging 
        log.info("Method accessed");
        return purchaseResponse;
    }
    

    @PostMapping("/payment-intent")
    public ResponseEntity<String> createPaymentIntent(@RequestBody PaymentInfo paymentInfo) throws StripeException{

        // logging 
       // log.info("paymentInfo.amount: " + paymentInfo.getAmount());

        PaymentIntent paymentIntent = checkoutService.createPaymentIntent(paymentInfo);

        String paymentStr = paymentIntent.toJson();
        
        return new ResponseEntity<>(paymentStr, HttpStatus.OK);

    }

    
    
}
