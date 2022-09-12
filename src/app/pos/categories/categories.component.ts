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
  ) {}
  categories: any[] = [];
  products: any[] = [];
  currentSelectedCategory: any = null;
  newCategories: any[] = [];
  options: any[] = []
  // [
  //   {
  //     name: 'Indian',
  //     subcategories: [
  //       'Roti',
  //       'Rice Basmati',
  //       'Main Course/curries',
  //       'Jain special',
  //       'Starters',
  //       'Salad/papad',
  //       'Rice',
  //       'Salad/papad',
  //     ],
  //   },
  //   {
  //     name: 'South Indian',
  //     subcategories: [
  //       'Snacks',
  //       'Sada Plaza',
  //       'Traditional Masala Plaza',
  //       'Combination Masala Plaza',
  //       'Healthy Uttappa',
  //       'special Uttappa',
  //       "Thin & Crispy Dosa's",
  //       "Chinese Fusion Dosa's",
  //       'Chopsuey Plaza',
  //       'Spicy Plaza',
  //       "Russian Salad Dosa's",
  //       'Mexican Style Dosa',
  //       '4ft Dosa',
  //       '',
  //     ],
  //   },
  //   {
  //     name: 'Mumbai Chaat',
  //     subcategories: ['Mumbai Pav Bhaji'],
  //   },
  //   {
  //     name: 'Chinese Veg.',
  //     subcategories: [
  //       'Starters',
  //       'Soup',
  //       'Main Course',
  //       'Rice',
  //       'Noodles',
  //       'Sizzlers',
  //     ],
  //   },
  //   {
  //     name: 'Combos',
  //     subcategories: ['Punjabi Combo', 'Chinese Combo'],
  //   },
  //   {
  //     name: 'Italian',
  //     subcategories: ['Italian'],
  //   },
  // ];
  ngOnInit(): void {
    this.databaseService.getMainCategories().then((data: any) => {
      // console.log("Main Categoris",data.data().categories)
      // this.options = data.data().categories;
      this.options = [];
      data.forEach((element: any) => {
        this.options.push({ ...element.data(), id: element.id });
      });
      this.databaseService.getRecipes().then((docs) => {
        docs.forEach((doc: any) => {
          // // console.log("recipes",doc.data())
          this.products.push({ ...doc.data(), id: doc.id });
          this.categories.push(doc.data().categories);
        });
        let filteredCat: any[] = [];
        this.categories.forEach((item, index) => {
          let found = false;
          // // console.log(item)
          filteredCat.forEach((item2) => {
            if (item2.name == item.name) {
              found = true;
            }
          });
          if (!found) {
            filteredCat.push(item);
          }
        });
        // console.log("categories",filteredCat)
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
        this.categories = refinedCats;
      });
    });
    // this.databaseService.getCategories().then((docs)=>{
    //   docs.forEach((doc:any)=>{
    //     this.categories.push(doc.data())
    //   })
    //   // console.log(this.categories)
    // })
   
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
  openSwitcher(data:any){
    console.log(this.categories)
    this.categories.forEach((cat:any)=>{
      cat.visible = false;
    })
    data.visible=true
  }
}
type Category = {
  id?: string;
  title: string;
  subcategories: string[];
};
