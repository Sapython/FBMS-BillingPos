import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithRedirect,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  addDoc,
  collection,
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { updateDoc } from '@firebase/firestore';
import { EMPTY, map, Observable, Subscription } from 'rxjs';
import { Device } from '../structures/application.structures';
import { DataProviderService } from './data-provider.service';
import { DatabaseService } from './database.service';
import { AlertsAndNotificationsService } from './uiService/alerts-and-notifications.service';
import { liveQuery } from 'dexie';
import { IndexedDatabaseService } from './indexed-database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private userServerSubscription: Subscription | undefined = undefined;
  public readonly user: Observable<User | null> = EMPTY;
  userDoc: any;
  private loggedIn: boolean = false;
  private readonly userDisposable: Subscription | undefined;
  constructor(
    private auth: Auth,
    private dataProvider: DataProviderService,
    private firestore: Firestore,
    private alertify: AlertsAndNotificationsService,
    private router: Router,
    private indexedDB:IndexedDatabaseService
  ) {
    this.dataProvider.currentProject = localStorage.getItem('currentProject') || undefined
    if (auth) {
      this.user = authState(this.auth);
      this.user.subscribe((u: User | null) => {
        if (u) {
          this.dataProvider.userID = u.uid;
        }
      });
      this.setDataObserver(this.user);
      this.userDisposable = authState(this.auth)
        .pipe(map((u) => !!u))
        .subscribe((isLoggedIn) => {
          this.loggedIn = isLoggedIn;
          dataProvider.loggedIn = isLoggedIn;
        });
    } else {
      this.loggedIn = false;
    }
  }
  authorized: any;

  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const value: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      this.authorized = value;
      let data = await this.getProjects();
      // // console.log('projects all', refinedData);
      if (data) {
        let refinedData = data.data();
        if (refinedData) {
          if (refinedData['projects'] && refinedData['projects'].length > 0) {
            const projects = refinedData['projects'].filter((element: any) => {
              // console.log(element);
              return element.mails.includes(value.user.email);
            });
            if (projects.length > 0) {
              this.dataProvider.projects = projects;
              if (projects.length > 1) {
                this.router.navigate(['/projectSelector']);
              } else {
                this.dataProvider.currentProject = projects[0];
                return true;
              }
            } else {
              this.warnAndLogout();
            }
          } else {
            this.warnAndLogout();
          }
        }
      } else {
        this.warnAndLogout();
      }
      // console.log('User signed in', value);
      this.alertify.presentToast('User signed in');
      return true;
    } catch (error) {
      // console.log('Error signing in', error);
      this.alertify.presentToast('Error signing in. ' + error, 'error');
      return false;
    }
  }
  warnAndLogout() {
    // alert('Because of no associated projects found for this email you will be logged out.')
    // this.logout(true);
  }
  logout(noConfirm: boolean = false) {
    if (noConfirm || confirm('Are you sure you want to log out?')) {
      this.auth.signOut();
      this.router.navigate(['/']);
    }
  }
  signInWithGoogle() {
    signInWithRedirect(this.auth, new GoogleAuthProvider()).then(
      (value: UserCredential) => {
        this.authorized = value;
        // console.log('User signed in', value);
      }
    );
  }

  getProjects() {
    return getDoc(doc(this.firestore, 'business/accounts'));
  }

  generateRandomId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private setDataObserver(user: Observable<User | null>) {
    // // console.log('Starting data observer')
    let projectSubscription: Subscription = Subscription.EMPTY;
    if (user) {
      // console.log('Setting data observer');
      user.subscribe((u) => {
        if (u) {
          this.dataProvider.loggedIn = true;
          this.dataProvider.gettingUserData = true;
          this.userDoc = doc(this.firestore, 'users/' + u.uid);
          if (this.userServerSubscription != undefined) {
            this.userServerSubscription.unsubscribe();
          }
          this.userServerSubscription = docData(this.userDoc).subscribe(
            (data: any) => {
              this.dataProvider.userChanged.next(data);
              this.dataProvider.userData = data;
              this.dataProvider.gettingUserData = false;
              projectSubscription.unsubscribe();
              projectSubscription = docData(
                doc(this.firestore, 'business/accounts')
              ).subscribe(async (projectsData: any) => {
                console.log("BUISNESS ACCOUNTS", projectsData);
                this.dataProvider.allProjects = []
                this.dataProvider.userChanged.next(data);
                if (projectsData) {
                  this.dataProvider.allProjects = projectsData.projects;
                  const projects:any[] = projectsData['projects'].filter(
                    (project: any) =>
                      project &&
                      project.mails &&
                      project.mails.includes(u.email)
                  );
                  this.dataProvider.projects = projects;
                  console.log("ALLPROJECTS", projects,projects[0].projectId);
                  localStorage.setItem('currentProject', JSON.stringify(projects[0]));
                  // console.log("INDEX DB DATA",await this.indexedDB.deleteDeviceData());
                  // console.log("ADD DB DATA",await this.indexedDB.addDeviceData({index:'projectId',currentProjectId:projects[0].projectId}));
                  // console.log("INDEX DB DATA",await this.indexedDB.getDeviceData());
                  this.dataProvider.currentProject = projects[0];
                  docData(
                    doc(
                      this.firestore,
                      'business/accounts/' +
                        this.dataProvider.currentProject?.projectId +
                        '/counters'
                    ),
                    { idField: 'id' }
                  ).subscribe((data: any) => {
                    console.log(
                      'Counters',
                      data,
                      this.dataProvider.currentProject
                      );
                      if (!(data && data.bills>=0)) {
                        setDoc(doc(this.firestore,'business/accounts/' +
                        this.dataProvider.currentProject?.projectId +
                        '/counters'),{bills:0,ingredients:0});
                      } else {
                        this.dataProvider.currentTokenNo = data.bills || 0;
                        this.dataProvider.billNo = data.allBills || 0;
                        this.dataProvider.ncBillNo = data.ncBills || 0;
                        console.log("TOKEN NO",this.dataProvider.currentTokenNo);
                      }
                  });
                  if (projects.length > 0) {
                    this.dataProvider.projects = projects;
                    var localDeviceData = localStorage.getItem('deviceData');
                    if (localDeviceData) {
                      try {
                        var finalLocalDeviceData: any =
                          JSON.parse(localDeviceData);
                      } catch (error) {
                        this.dataProvider.loginEvent = {
                          loggedIn: true,
                          status: 'deviceNotRegistered',
                        };
                        this.dataProvider.userChanged.next(true);
                        var finalLocalDeviceData: any = {};
                      }
                      // console.log('local device data', localDeviceData,finalLocalDeviceData,projects)
                      if (finalLocalDeviceData['deviceId'] != null) {
                        const devicesProjects = projects.filter(
                          (project: any) => {
                            return (
                              project.devices &&
                              project.devices.includes(
                                finalLocalDeviceData.deviceId
                              )
                            );
                          }
                        );
                        if (devicesProjects.length > 0) {
                          this.dataProvider.loginEvent = {
                            loggedIn: true,
                            status: 'withProject',
                          };
                          this.dataProvider.userChanged.next(true);
                        } else {
                          let id = this.generateRandomId();
                          let users = finalLocalDeviceData.users || [];
                          const duplicates = users.find(
                            (element: any) =>
                              element.email == u.email && element.uid == u.uid
                          );
                          if (!duplicates) {
                            users = [
                              {
                                email: u.email || '',
                                uid: u.uid || '',
                              },
                              ...(finalLocalDeviceData.users || []),
                            ];
                          }
                          // console.log('users', projects)
                          let deviceData: Device = {
                            deviceId: id,
                            registrationDate: new Date(),
                            users: users,
                            projectId: projects[0].projectId,
                            projectName: projects[0].projectName,
                          };
                          // console.log('device data', deviceData)
                          await addDoc(
                            collection(
                              this.firestore,
                              'business/devices/' + id
                            ),
                            deviceData
                          );
                          await updateDoc(
                            doc(this.firestore, 'business/accounts/'),
                            {
                              projects: this.dataProvider.allProjects.map((project: any) => {
                                if (
                                  project.projectId == projects[0].projectId
                                ) {
                                  return {
                                    ...project,
                                    devices: [...(project.devices || []), id],
                                  };
                                } else {
                                  return project;
                                }
                              }),
                            }
                          );
                          console.log(projects[0].projectId,id,
                            {
                              projects: this.dataProvider.allProjects.map((project: any) => {
                                if (
                                  project.projectId == projects[0].projectId
                                ) {
                                  return {
                                    ...project,
                                    devices: [...(project.devices || []), id],
                                  };
                                } else {
                                  return project;
                                }
                              }),
                            }
                          )
                          // console.log('device data', deviceData)
                          localStorage.setItem(
                            'deviceData',
                            JSON.stringify(deviceData)
                          );
                        }
                      } else {
                        this.dataProvider.loginEvent = {
                          loggedIn: true,
                          status: 'deviceNotRegistered',
                        };
                        this.dataProvider.userChanged.next(true);
                        localStorage.setItem(
                          'deviceData',
                          JSON.stringify({ deviceId: 'test' })
                        );
                      }
                    } else {
                      this.dataProvider.loginEvent = {
                        loggedIn: true,
                        status: 'deviceNotRegistered',
                      };
                      this.dataProvider.userChanged.next(true);
                      localStorage.setItem(
                        'deviceData',
                        JSON.stringify({ deviceId: 'test' })
                      );
                    }
                  } else {
                    this.dataProvider.loginEvent = {
                      loggedIn: true,
                      status: 'noProjects',
                    };
                    this.dataProvider.userChanged.next(true);
                    // console.log('no projects found for this user',this.dataProvider.loginEvent)
                  }
                } else {
                  // console.log('no projects found')
                  this.dataProvider.loginEvent = {
                    loggedIn: true,
                    status: 'noProjects',
                  };
                  this.dataProvider.userChanged.next(true);
                }
              });
            }
          );
        } else {
          // console.log('loggedOut')
          this.dataProvider.loginEvent = {
            loggedIn: false,
            status: 'loggedOut',
          };
          this.dataProvider.userChanged.next(true);
        }
      });
    } else {
      // // console.log('loggedOut 1')
      this.dataProvider.loginEvent = {
        loggedIn: false,
        status: 'loggedOut',
      };
      this.dataProvider.userChanged.next(true);
      // console.log('No user');
      if (this.userServerSubscription != undefined) {
        this.userServerSubscription.unsubscribe();
      }
    }
  }
}
