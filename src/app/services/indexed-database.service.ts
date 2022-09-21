import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Category, Device } from '../structures/method.structure';

@Injectable({
  providedIn: 'root'
})
export class IndexedDatabaseService extends Dexie {
  localCategories!: Table<Category, number>
  localDeviceData!: Table<Device, string>;
  constructor() {
    super('ngdexieliveQuery');
    this.version(1).stores({
      localDeviceData: 'index',
    });
  } 

  async addDeviceData(data:Device){
    return await this.localDeviceData.add(data,"index");
  }
  async getDeviceData(){
    return await this.localDeviceData.get("b8588uq3swtnwa1t83lla9");
  }
  async updateDeviceData(data:any){
    return await this.localDeviceData.update("device",data);
  }
  async deleteDeviceData(){
    return await this.localDeviceData.delete("b8588uq3swtnwa1t83lla9");
  }
  
  addCategories(data:Category[]){
    this.localCategories.bulkAdd(data);
  }
  getCategories(){
    return this.localCategories.toArray();
  }
  updateCategories(data:Category[]){
    this.localCategories.bulkPut(data);
  }
  deleteCategories(){
    this.localCategories.clear();
  }
}
