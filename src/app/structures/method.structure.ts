export type PageSetting={
    blur:boolean;
    lastRedirect:string;
    message:string;
    messageType:'Error'|'Warning'|'Success'|'Info';
    spinner:boolean;
}
export type ExtraLoginGoogleInfo={
    phoneNumber:string;
}
export type ExtraLoginEmailInfo= {
    displayName:string;
    phoneNumber:string;
    photoURL:string;
}
export type Product={
    name:string;
    price:number;
    description:string;
    images:{
        'imageOne':any;
        'imageTwo':any;
    },
    category:string;
    id:string;
    dateOfPublish:Date;
    vegetarian:boolean;
}
export type CustomizedProduct={
    product:Product;
    quantity:number;
}
export type Category = {
    name:string;
    id:string;
    products:Product[];
}
export type OrderProduct = {
    productName:string;
    quantity:number;
    price:number;
    id:string;
    image:{
        'imageOne':any;
        'imageTwo':any;
    };
}
export type Order={
    orderId:string;
    amount:number;
    paymentId:string;
    paymentStatus:'unpaid'|'paid'|'processing'|'ready'|'delivered';
    products:any[];
    dateOfOrder:Date;
    address:string;
    coordinates:{lat:number,lng:number};
    type:'room'|'product';
    paymentType:'offline'|'online';
}
export type RoomOrder = {
    orderId:string;
    amount:number;
    paymentId:string;
    roomNo:string;
    roomType:string;
}



