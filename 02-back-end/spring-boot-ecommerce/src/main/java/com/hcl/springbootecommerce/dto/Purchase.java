package com.hcl.springbootecommerce.dto;

import java.util.Set;

import com.hcl.springbootecommerce.entity.Address;
import com.hcl.springbootecommerce.entity.Customer;
import com.hcl.springbootecommerce.entity.Order;
import com.hcl.springbootecommerce.entity.OrderItem;

import lombok.Data;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

    
}
