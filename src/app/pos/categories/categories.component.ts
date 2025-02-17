import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';

import Fuse from 'fuse.js';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  // @Output() categorySelected: EventEmitter<any>  =  new EventEmitter();
  searchedProducts: any[] = [];
  constructor(
    private databaseService: DatabaseService,
    public dataProvider: DataProviderService
  ) {
    // this.products = JSON.parse(localStorage.getItem('products') || '[]')
    // this.categories = JSON.parse(localStorage.getItem('categories') || '[]')
  }
  categories: any[] = [];
  products: any[] = [];
  currentSelectedCategory: any = null;
  newCategories: any[] = [];
  options: any[] = []
  ngOnInit(): void {
    // this.categories = JSON.parse(localStorage.getItem('categories') || '[]')
    this.products = []
    this.categories = []
    this.dataProvider.pageSetting.blur = true;
    this.databaseService.getMainCategories().then((data: any) => {
      // console.log("Main Categories",data)
      // this.options = data.data().categories;
      this.options = [];
      data.forEach((element: any) => {
        // console.log("CAt",element.data());
        this.options.push({ ...element.data(), id: element.id });
      });
      // console.log(this.options);
      this.getDineInProducts();
      this.dataProvider.modeSelected.subscribe((data) => {
        if(data=='dineIn'){
          this.getDineInProducts()
        } else if (data=='room') {
          this.getRoomProducts()
        } else if (data=='takeaway'){
          this.getDineInProducts()
          this.dataProvider.takeawayMode = true;
        }
      })    
    });
    this.dataProvider.searchEvent.subscribe((data: string) => {
      // // console.log("searchEvent",data)
      const options = {
        keys: ['name', 'displayName'],
      };
      const fuse = new Fuse(this.categories, options); // "list" is the item array
      const result = fuse.search(data);
      this.searchedProducts = [];
      // // console.log("result",result)
      result.forEach((product: any) => {
        this.searchedProducts.push(product.item);
      });
    });
  }
  getRoomProducts(){
    this.products = []
    this.categories = []
    this.dataProvider.pageSetting.blur = true;
    this.databaseService.getRoomRecipes().then((docs) => {
      docs.forEach((doc: any) => {
        // console.log("recipes",doc.data())
        this.products.push({ ...doc.data(), id: doc.id });
        this.categories.push(doc.data().categories);
      });

      let filteredCat: any[] = [];
      this.categories.forEach((item, index) => {
        let found = false;
        // console.log(item)
        if (item){
          filteredCat.forEach((item2) => {
            if (item2.name == item.name) {
              found = true;
            }
          });
          if (!found) {
            filteredCat.push(item);
          }
        } else {
          console.log("No Category",index, this.products[index].id)
        }
      });
      // console.log("categories",filteredCat)  
      this.categories = filteredCat;
      // // console.log("products",this.products)
      this.dataProvider.categories = this.categories;
      this.dataProvider.products = this.products;
      // localStorage.setItem('products', JSON.stringify(this.products))
      const refinedCats: any[] = [];
      this.options.forEach((mainCategory) => {
        refinedCats.push({
          name: mainCategory.name,
          subcategories: this.categories.filter((item) => {
            return mainCategory.subCategories.includes(item.name);
          }),
          visible: false,
        });
      });
      console.log("refinedCats",refinedCats);
      this.categories = refinedCats;
      this.dataProvider.pageSetting.blur = false;
      // localStorage.setItem("categories",JSON.stringify(this.categories))
    });
  }
  getDineInProducts() {
    this.products = []
    this.categories = []
    this.dataProvider.pageSetting.blur = true;
    this.databaseService.getRecipes().then((docs) => {
      docs.forEach((doc: any) => {
        this.products.push({ ...doc.data(), id: doc.id });
        this.categories.push(doc.data().categories);
      });
      let filteredCat: any[] = [];
      this.categories.forEach((item, index) => {
        let found = false;
        // console.log(item)
        if (item){
          filteredCat.forEach((item2) => {
            if (item2.name == item.name) {
              found = true;
            }
          });
          if (!found) {
            filteredCat.push(item);
          }
        } else {
          console.log("No Category",index, this.products[index].id)
        }
      });
      this.categories = filteredCat;
      // // console.log("products",this.products)
      this.dataProvider.categories = this.categories;
      this.dataProvider.products = this.products;
      const refinedCats: any[] = [];
      this.options.forEach((mainCategory) => {
        refinedCats.push({
          name: mainCategory.name,
          subcategories: this.categories.filter((item) => {
            return mainCategory.subCategories.includes(item.name);
          }),
          visible: false,
        });
      });
      console.log("refinedCats",refinedCats);
      this.categories = refinedCats;
      this.dataProvider.pageSetting.blur = false;
      // localStorage.setItem("categories",JSON.stringify(this.categories))
    });
  }
  openSwitcher(data:any,category:any){
    console.log("data,category",data,category)
    this.dataProvider.selectedCategory.next(category)
    console.log(this.categories)
    const dataCopy = JSON.parse(JSON.stringify(data))
    this.categories.forEach((cat:any)=>{
      cat.visible = false;
    })
    data.visible=!dataCopy.visible
  }
}
type Category = {
  id?: string;
  title: string;
  subcategories: string[];
};
