package com.hcl.springbootecommerce.service;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.transaction.Transactional;

import com.hcl.springbootecommerce.dao.CustomerRepository;
import com.hcl.springbootecommerce.dao.ProductRepository;
import com.hcl.springbootecommerce.dto.PaymentInfo;
import com.hcl.springbootecommerce.dto.Purchase;
import com.hcl.springbootecommerce.dto.PurchaseResponse;
import com.hcl.springbootecommerce.entity.Customer;
import com.hcl.springbootecommerce.entity.Order;
import com.hcl.springbootecommerce.entity.OrderItem;
import com.hcl.springbootecommerce.entity.Product;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;



@Service
public class CheckoutServiceImpl implements CheckoutService {

    public CustomerRepository customerRepository;
    public ProductRepository productRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository, @Value("${stripe.key.secret}") String secretKey){
        this.customerRepository = customerRepository;

        Stripe.apiKey = secretKey;

    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase){
      
        Order order = purchase.getOrder();
       
         
        



        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        Set<OrderItem> orderItems = purchase.getOrderItems();
    


    //    orderItems.forEach(item -> { 
             
    //             Product product = productRepository.getById(item.getProductId());
    //             // product.setUnitsInStock(product.getUnitsInStock() - item.getQuantity());
           
           
        

        
    //     });
        orderItems.forEach(item -> order.add(item));


        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());
        

        Customer customer = purchase.getCustomer();


        String theEmail = customer.getEmail();

        Customer customerFromDb = customerRepository.findByEmail(theEmail);
        System.out.println(customerFromDb);
        if(customerFromDb != null){
            customer = customerFromDb;
           customer.add(order);
           return new PurchaseResponse(orderTrackingNumber);
        }

        customer.add(order);

        customerRepository.save(customer);


        return new PurchaseResponse(orderTrackingNumber);
        

    }

   

    private static String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
        List<String> paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");

        Map<String, Object> params = new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types", paymentMethodTypes);
        params.put("description", "HCLTechStore Purchase");
        params.put("receipt_email", paymentInfo.getReceiptEmail());
        return PaymentIntent.create(params);
    }



    
}
