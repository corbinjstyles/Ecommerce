import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { ProductListComponent } from '../components/product-list/product-list.component';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  
  
  private categoryUrl = 'http://localhost:8080/api/product-category'
  private baseUrl = 'http://localhost:8080/api/products'

  constructor(private httpClient: HttpClient) { }

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<getResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`+ `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<getResponseProducts>(searchUrl);
    
  }
  getProductList(theCategoryId: number): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchUrl);
    
  }

getProductCatergories(): Observable<ProductCategory[]>{
  return this.httpClient.get<getResponseProductCategory>(this.categoryUrl).pipe(
    map(response => response._embedded.productCategory));
}
searchProducts(theKeyword: string): Observable<Product[]>{
  const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

  return this.httpClient.get<getResponseProducts>(searchUrl).pipe(
    map(response => response._embedded.products));
  }

  searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<getResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`+ `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<getResponseProducts>(searchUrl);
    
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<getResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products));
  }
  getProduct(theProductId: number): Observable<Product>  {

    const productUrl = `${this.baseUrl}/${theProductId}`;

    return this.httpClient.get<Product>(productUrl);
    
  }
}

interface getResponseProducts{
  _embedded: {
    products : Product[];
  },
  page:{
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}
interface getResponseProductCategory{
  _embedded: {
    productCategory : ProductCategory[];
  }
}

