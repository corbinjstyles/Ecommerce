package com.hcl.springbootecommerce.service;


import java.util.Set;
import java.util.UUID;

import javax.transaction.Transactional;

import com.hcl.springbootecommerce.dao.CustomerRepository;
import com.hcl.springbootecommerce.dto.Purchase;
import com.hcl.springbootecommerce.dto.PurchaseResponse;
import com.hcl.springbootecommerce.entity.Customer;
import com.hcl.springbootecommerce.entity.Order;
import com.hcl.springbootecommerce.entity.OrderItem;

import org.springframework.stereotype.Service;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    public CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository){
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {

        Order order = purchase.getOrder();

        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        Set<OrderItem> orderItems = purchase.getOrderItems();
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



    
}
