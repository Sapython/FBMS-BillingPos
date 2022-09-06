import { UserData } from "./user.structure";

export type Device = {
    deviceId: string;
    registrationDate: Date;
    users:{
        email:string;
        uid:string;
    }[];
    projectId:string;
    projectName:string;
}