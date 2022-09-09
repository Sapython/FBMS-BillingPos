import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';

import Fuse from 'fuse.js'

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  // @Output() categorySelected: EventEmitter<any>  =  new EventEmitter();
  searchedProducts:any[] = [];
  constructor(private databaseService:DatabaseService,public dataProvider:DataProviderService) { }
  categories:any[] = []
  products:any[] = []
  currentSelectedCategory:any = null;
  ngOnInit(): void {
    // this.databaseService.getCategories().then((docs)=>{
    //   docs.forEach((doc:any)=>{
    //     this.categories.push(doc.data())
    //   })
    //   console.log(this.categories)
    // })
    this.databaseService.getRecipes().then((docs)=>{
      docs.forEach((doc:any)=>{
        // console.log("recipes",doc.data())
        this.products.push({...doc.data(),id:doc.id})
        this.categories.push(doc.data().categories)
      })
      let filteredCat:any[] = []
      this.categories = this.categories.filter((item, index) => {
        let found = false
        console.log(item)
        filteredCat.forEach((item2) => {
          if (item2.name == item.name) {
            found = true
          }
        })
        if (!found) {
          filteredCat.push(item)
        }
      })
      console.log("categories",filteredCat)
      this.categories = filteredCat
      // console.log("products",this.products)
      this.dataProvider.categories = this.categories
      this.dataProvider.products = this.products
    })
    this.dataProvider.searchEvent.subscribe((data:string)=>{
      console.log("searchEvent",data)
      const options = {
        keys: [
          "name",
          "displayName"
        ]
      };
      const fuse = new Fuse(this.categories,options); // "list" is the item array
      const result = fuse.search(data);
      this.searchedProducts = [];
      console.log("result",result)
      result.forEach((product:any)=>{
        this.searchedProducts.push(product.item);
      })
    })
  }
}
type Category = {
  id?:string;
  title:string,
  subcategories:string[]
}