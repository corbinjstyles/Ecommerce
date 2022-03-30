import { Product } from "./product";

export class CartItem {

    id: number;
    name: string;
    imageUrl: string;
    unitPrice: number;
    unitsInStock: number;
    quantity: number;

    constructor(product: Product){
        this.id = product.id;
        this.name = product.name;
        this.imageUrl = product.imageUrl;
        this.unitPrice = product.unitPrice;
        this.unitsInStock = product.unitsInStock;
        this.quantity =  1;

    }

}
