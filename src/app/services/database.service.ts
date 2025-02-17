import { Injectable } from '@angular/core';
import {
  getDocs,
  Firestore,
  collection,
  query,
  collectionSnapshots,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  collectionData,
  increment,
  where,
  setDoc,
  docData,
  arrayUnion,
  orderBy,
} from '@angular/fire/firestore';
import { DataProviderService } from './data-provider.service';
import { AuthenticationService } from './authentication.service';
import { first } from 'rxjs';
import { Bill } from '../pos/bill/bill.component';
@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  allTables: any[] = [];
  constructor(
    private fs: Firestore,
    private dataProvider: DataProviderService
  ) {}
  deviceName: string = '';
  getCategories() {
    return getDocs(collection(this.fs, 'categories'));
  }

  getProducts() {
    return collectionSnapshots(query(collection(this.fs, 'recipes')));
  }

  updateProject(projects: any[]) {
    return updateDoc(doc(this.fs, 'business/accounts'), {
      projects: projects,
    });
  }

  addTokenNo() {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/counters'
      ),
      {
        bills: increment(1),
      }
    );
  }

  addBillNo() {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/counters'
      ),
      {
        allBills: increment(1),
      }
    );
  }

  addNcBillNo() {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/counters'
      ),
      {
        ncBills: increment(1),
      }
    );
  }

  getRecipes() {
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/recipes/recipes'
      )
    );
  }

  getRoomRecipes() {
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/recipes/roomRecipes'
      )
    );
  }

  getTaxes() {
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/taxes/taxes'
      )
    );
  }

  addKot(kotData: any) {
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

  async continueDeviceSetup(position: any, deviceData: any) {
    if (!position) {
      return false;
    }
    const data = {
      device: 'POS',
      date: new Date(),
      project: this.dataProvider.currentProject,
      user: this.dataProvider.userID,
      ...position,
      ...deviceData,
    };
    // console.log('POS', data);
    const res = await addDoc(collection(this.fs, 'devices'), data);
    if (this.dataProvider.projects.length > 0) {
      const newProjects = this.dataProvider.projects.map((p) => {
        if (p.projectId == this.dataProvider.currentProject.projectId) {
          if (p['devices'] == undefined) {
            p['devices'] = [];
          }
          p['devices'].push(res.id);
        }
        return p;
      });
    }
    // // console.log('newProjects',newProjects,this.dataProvider.projects)
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
    return res;
  }

  getTablesPromise() {
    return getDocs(
      query(
        collection(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/tables/tables'
        ),
        orderBy('tableNo')
      )
    );
  }

  getTables() {
    return collectionSnapshots(
      query(
        collection(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/tables/tables'
        ),
        orderBy('tableNo')
      )
    );
  }
  getRooms() {
    return collectionSnapshots(
      query(
        collection(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/rooms/rooms'
        ),
        orderBy('tableNo')
      )
    );
  }

  getCustomers() {
    return collectionSnapshots(
      query(
        collection(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/bills/bills'
        ),
        where('customerInfo.phone', '!=', '')
      )
    );
  }

  getKots() {
    return collectionSnapshots(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/kots/kots'
      )
    );
  }

  saveKot(kotData: any) {
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

  getCounters() {
    return docData(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/counters'
      ),
      { idField: 'id' }
    );
  }

  async useTable(table: any, billId: string) {
    await updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId
      ),
      {
        tableId: table.id,
        table: table,
      }
    );
    await updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/tables/tables/' +
          table.id
      ),
      {
        status: 'occupied',
        bill: billId,
        tableStart: new Date(),
      }
    );
  }

  async createBill(billData: any, id: string) {
    // alert('CReating bill');
    // console.log('billData', billData);
    const res = await setDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          id
      ),
      billData
    );
    if (billData.table) {
      if (billData.table.type == 'table') {
        await updateDoc(
          doc(
            this.fs,
            'business/accounts/' +
              this.dataProvider.currentProject?.projectId +
              '/tables/tables/' +
              billData.tableId
          ),
          {
            status: 'occupied',
            bill: id,
            tableStart: new Date(),
          }
        );
      } else {
        await updateDoc(
          doc(
            this.fs,
            'business/accounts/' +
              this.dataProvider.currentProject?.projectId +
              '/rooms/rooms/' +
              billData.tableId
          ),
          {
            status: 'occupied',
            bill: id,
            tableStart: new Date(),
          }
        );
      }
    }
    return res;
  }

  async updateBill(billData: any, billId: string) {
    console.log(
      this.fs,
      'business/accounts/' +
        this.dataProvider.currentProject?.projectId +
        '/bills/bills/' +
        billId
    );
    return await updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId
      ),
      billData
    );
  }
  addToKot(kotData: any, id: string, billId: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId +
          '/kots/' +
          id
      ),
      {
        products: kotData,
      }
    );
  }

  async finalizeKot(
    billData: any,
    id: string,
    billId: string,
    tableId: string
  ) {
    if (billData.table.type == 'table') {
      await updateDoc(
        doc(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/tables/tables/' +
            tableId
        ),
        {
          status: 'occupied',
          bill: billId,
        }
      );
    } else {
      await updateDoc(
        doc(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/rooms/rooms/' +
            tableId
        ),
        {
          status: 'occupied',
          bill: billId,
        }
      );
    }
    await updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId +
          '/kots/' +
          id
      ),
      {
        products: billData,
      }
    );

    return await this.createKot([], billId);
  }

  getBills() {
    return collectionSnapshots(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills'
      )
    );
  }

  getCompletedBills(startDate: Date, endDate: Date) {
    return collectionSnapshots(
      query(
        collection(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/bills/bills'
        ),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      )
    );
  }

  getBill(billId: string) {
    return getDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId
      )
    );
  }

  getBillsStream() {
    return collectionData(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills'
      ),
      { idField: 'id' }
    );
  }

  deductStockItem(id: any, amount: number) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/ingredients/ingredients/' +
          id
      ),
      {
        quantity: increment(-amount),
      }
    );
  }

  deleteBill(
    id: string,
    reason: string,
    phone: string,
    type: 'made' | 'unmade'
  ) {
    // /business/accounts//bills/bills/vuh0GUX9K609Gjr9szaP
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          id
      ),
      {
        deleted: true,
        reason: reason,
        phone: phone,
        type: type,
      }
    );
  }

  getCancelledBills() {
    return collectionSnapshots(
      query(
        collection(
          this.fs,
          'business/accounts/' +
            this.dataProvider.currentProject?.projectId +
            '/bills/bills'
        ),
        where('deleted', '==', true)
      )
    );
  }

  recoverBill(id: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          id
      ),
      {
        deleted: false,
        reason: '',
      }
    );
  }

  updatePaymentType(id: string, data: any) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          id
      ),
      { paymentType: data }
    );
  }

  updateDineMethod(id: string, data: any) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          id
      ),
      { dineMethod: data }
    );
  }

  async createKot(kotData: any, billId: any) {
    // await setDoc(doc(this.fs,'business/accounts/'+this.dataProvider.currentProject?.projectId +'/bills'),{
    //   dailyCounter:increment(1),
    // },{merge:true});
    return addDoc(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId +
          '/kots'
      ),
      { products: kotData, billId: billId }
    );
  }

  getKot(kotId: string, billId: string) {
    // console.log('business/accounts/' +
    // this.dataProvider.currentProject?.projectId +
    // '/bills/bills/'+billId+'/kots/'+kotId)
    return getDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId +
          '/kots/' +
          kotId
      )
    );
  }

  emptyTable(id: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/tables/tables/' +
          id
      ),
      {
        status: 'available',
        bill: '',
        billData: null,
      }
    );
  }

  emptyRoom(id: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/rooms/rooms/' +
          id
      ),
      {
        status: 'available',
        bill: '',
        billData: null,
      }
    );
  }

  finalizeTable(id: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/tables/tables/' +
          id
      ),
      {
        finalized: true,
      }
    );
  }

  finalizeRoom(id: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/rooms/rooms/' +
          id
      ),
      {
        finalized: true,
      }
    );
  }

  async finalizeBill(id: string, table: any) {
    // make table available
    await this.emptyTable(table.id);
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          id
      ),
      {
        finalized: true,
      }
    );
  }

  getMainCategories() {
    console.log(
      'business/accounts/' +
        this.dataProvider.currentProject?.projectId +
        '/recipes/categoryGroups'
    );
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/recipes/categoryGroups'
      )
    );
  }

  updateKot(kotId: string, billId: string, data: any) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billId +
          '/kots/' +
          kotId
      ),
      { products: data }
    );
  }

  getDiscounts() {
    return collectionData(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/discounts/discounts'
      ),
      { idField: 'id' }
    );
  }

  settleBill(billData: Bill, customerInfo: any, paymentMethod: string) {
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          billData.id
      ),
      { ...billData, customerInfo: customerInfo, paymentType: paymentMethod }
    );
  }

  async saveBillModification(oldBillData: any, newBillData: any) {
    await addDoc(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          oldBillData.id +
          '/modifications'
      ),
      { oldBillData: oldBillData, newBillData: newBillData }
    );
    return updateDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/bills/bills/' +
          oldBillData.id
      ),
      {
        ...newBillData,
        modified: true,
      }
    );
  }

  getCheckerCategories() {
    return getDocs(
      collection(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/recipes/categories'
      )
    );
  }

  setSettings() {
    console.log(
      'setting settings letm',
      'business/accounts/' +
        this.dataProvider.currentProject?.projectId +
        '/settings'
    );
    getDoc(
      doc(
        this.fs,
        'business/accounts/' +
          this.dataProvider.currentProject?.projectId +
          '/settings'
      )
    ).then((data) => {
      this.dataProvider.settings = data.data();
      console.log('settings', this.dataProvider.settings);
      // if (this.dataProvider.settings.billTokenRefreshTime == 'monthly') {
      //   let currentDate = new Date();
      //   // get last day of the month
      //   let lastMonthDate = new Date(
      //     currentDate.getFullYear(),
      //     currentDate.getMonth() + 1,
      //     0
      //   );
      //   // check if it's the last day of the month
      //   if (currentDate.getDate() == lastMonthDate.getDate()) {
      //     updateDoc(
      //       doc(
      //         this.fs,
      //         'business/accounts/' +
      //           this.dataProvider.currentProject?.projectId +
      //           '/settings'
      //       ),
      //       { allBills: 0, lastRefreshDate: currentDate }
      //     );
      //   }
      // } else if (this.dataProvider.settings.billTokenRefreshTime == 'daily') {
      //   let currentDate = new Date();
      //   let lastRefreshDate = this.dataProvider.settings.lastRefreshDate.toDate();
      //   if (
      //     currentDate.getDate() != lastRefreshDate.getDate() ||
      //     currentDate.getMonth() != lastRefreshDate.getMonth() ||
      //     currentDate.getFullYear() != lastRefreshDate.getFullYear()
      //   ) {
      //     updateDoc(
      //       doc(
      //         this.fs,
      //         'business/accounts/' +
      //           this.dataProvider.currentProject?.projectId +
      //           '/settings'
      //       ),
      //       { allBills: 0, lastRefreshDate: currentDate }
      //     );
      //   }
      // } else if (this.dataProvider.settings.billTokenRefreshTime == 'weekly') {
      //   let currentDate = new Date();
      //   let lastDayOfTheWeek = new Date(
      //     currentDate.getFullYear(),
      //     currentDate.getMonth(),
      //     currentDate.getDate() + (7 - currentDate.getDay())
      //   );
      //   // check if it's the last day of the month
      //   if (currentDate.getDate() == lastDayOfTheWeek.getDate()) {
      //     updateDoc(
      //       doc(
      //         this.fs,
      //         'business/accounts/' +
      //           this.dataProvider.currentProject?.projectId +
      //           '/settings'
      //       ),
      //       { allBills: 0, lastRefreshDate: currentDate }
      //     );
      //   }
      // } else if (this.dataProvider.settings.billTokenRefreshTime == 'yearly') {
      //   let currentDate = new Date();
      //   // get last day of the month
      //   let lastYearDate = new Date(
      //     currentDate.getFullYear() + 1,
      //     currentDate.getMonth() + 1,
      //     0
      //   );
      //   // check if it's the last day of the month
      //   if (currentDate.getDate() == lastYearDate.getDate()) {
      //     updateDoc(
      //       doc(
      //         this.fs,
      //         'business/accounts/' +
      //           this.dataProvider.currentProject?.projectId +
      //           '/settings'
      //       ),
      //       { allBills: 0, lastRefreshDate: currentDate }
      //     );
      //   }
      // }
    });
  }
}
