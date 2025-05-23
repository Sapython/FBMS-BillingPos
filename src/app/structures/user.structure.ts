export type UserData={
    userId:string;
    displayName:string;
    email:string;
    phoneNumber?:string;
    photoURL:string;
    emailVerified:boolean;
    firstLogin:boolean;
    access:UserAccess;
    currentProjectId?:string;
}
export type Friend ={
    userID:string;
    displayName:string;
    photoURL:string;
    email:string;
}

export type Image={
    url:string;
}

export type Discount={
    type:'Fixed' |'Percentage';
    value:number;
    featureText:string;
}

export type UserAccess={
    access:'admin'|'user'|'guest'|'posUser';
}
export type Order={
    orderId:string;
    items:[];
    total:number;
    date:Date;
    totalTax:number;
    totalShipping:number;
    totalDiscount:number;
    couponUsed:Coupon;
    payment:Payment;
    shipping:Shipping;
}
export type Coupon={
    couponId:string;
    code:string;
    discount:number;
    discountType:'Percentage'|'Fixed';
}
export type Payment={
    paymentId:string;
    paymentType:'Cash'|'Card'|'Paypal'|'GooglePay'|'ApplePay';
    paymentMethod:string;
    paymentStatus:'Pending'|'Success'|'Failed';
}
export type Shipping={
    shippingId:string;
    shippingType:'Standard'|'Express'|'Overnight';
    shippingMethod:string;
    shippingStatus:'Pending'|'Success'|'Failed';
}

export type ContactRequest = {
    name:string;
    email:string;
    phoneNumber:string;
    message:string;
    date:Date;
}

