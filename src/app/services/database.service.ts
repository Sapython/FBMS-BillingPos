import { Injectable } from '@angular/core';
import { getDocs,Firestore,collection,query, collectionSnapshots, addDoc, doc, updateDoc, getDoc, collectionData, increment } from '@angular/fire/firestore';
import { DataProviderService } from './data-provider.service';
import { AuthenticationService } from './authentication.service'
import { first } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  allTables:any[] = []
  constructor(private fs:Firestore,private dataProvider:DataProviderService) {
    
  }
  deviceName:string = '';
  getCategories(){
    return getDocs(collection(this.fs,'categories'))
  }

  getProducts(){
    return collectionSnapshots(query(collection(this.fs,'recipes')))
  }

  getRecipes(){
    console.log('Recipes path','business/accounts/' +
    this.dataProvider.currentProject?.projectId +
    '/recipes/recipes')
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/recipes/recipes'
      )
    );
  }

  getTaxes(){
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/taxes/taxes'
      )
    );
  }

  addKot(kotData:any){
    return addDoc(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/kots'
      ),
      kotData
    );
  }

  async continueDeviceSetup(position:any,deviceData:any) {
    if (!position){
      return false
    }
    const data = {
      device: 'POS',
      date: new Date(),
      project:this.dataProvider.currentProject,
      user:this.dataProvider.userID,
      ...position,
      ...deviceData
    }
    console.log("POS",data)
    const res = await addDoc(collection(this.fs,'devices'),data)
     if(this.dataProvider.projects.length > 0){
      const newProjects = this.dataProvider.projects.map((p) => {
        if (p.projectId == this.dataProvider.currentProject.projectId){
          if (p['devices']==undefined){
            p['devices'] = []
          }
          p['devices'].push(res.id)
        }
        return p
      })
     }
    // console.log('newProjects',newProjects,this.dataProvider.projects)
    // alert(JSON.stringify(newProjects))
    // localStorage.setItem('device',JSON.stringify({
    //   deviceId:res.id,
    //   ...data
    // }))
    // const setDevice = await updateDoc(doc(this.fs,'business/accounts'),{
    //   projects:newProjects
    // })
    // const userData = await updateDoc(doc(this.fs,'users'),{
    //   currentProjectId:this.dataProvider.currentProject.projectId,
    // })
    return res
  }

  getTables(){
    return getDocs( collection(this.fs, 'business/accounts/' + this.dataProvider.currentProject?.projectId + '/tables/tables'));
  }

  getKots(){
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/kots/kots'
      )
    );
  }

  saveKot(kotData:any){
    return addDoc(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/kots/kots'
      ),
      kotData
    );
  }

  createBill(billData:any){
    return addDoc(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills'
      ),
      billData
    );
  }
  
  updateBill(billData:any,id:string){
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/'+id
      ),
      billData
    );
  }

  getBills(){
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills'
      )
    );
  }

  getBillsStream(){
    return collectionData(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills'
      )
    );
  }

  deductStockItem(id:any,amount:number){
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/ingredients/ingredients/' + id
      ),
      {
      quantity:increment(-amount)
      }
    );
  }
}
