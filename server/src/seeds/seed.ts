import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import { User } from "../models/User";
import { Station } from "../models/Station";
import { Pump } from "../models/Pump";
import { Product } from "../models/Product";
import { Tank } from "../models/Tank";
import { Shift } from "../models/Shift";


dotenv.config();


async function seed(){

try{


await mongoose.connect(
    process.env.MONGO_URI!
);


console.log("MongoDB connected");


// clear database

await User.deleteMany({});
await Station.deleteMany({});
await Pump.deleteMany({});
await Product.deleteMany({});
await Tank.deleteMany({});
await Shift.deleteMany({});



// =====================
// Station
// =====================

const station = await Station.create({

    name:"Station Kiosque Tunis",

    code:"STN-001",

    address:"Tunisie",

    city:"Tunis",

    phone:"70000000",

    active:true

});


console.log("Station created");



// =====================
// Products
// =====================

const products = await Product.insertMany([

{
    name:"Gasoil",
    code:"GO",
    category:"FUEL",
    purchasePrice:2.1,
    sellingPrice:2.5,
    vatRate:19,
    unitOfMeasure:"LITER",
    minStockAlert:1000,
    currentStock:0
},

{
    name:"Sans Plomb",
    code:"SP",
    category:"FUEL",
    purchasePrice:2.3,
    sellingPrice:2.9,
    vatRate:19,
    unitOfMeasure:"LITER",
    minStockAlert:1000,
    currentStock:0
}

]);


console.log("Products created");



// =====================
// Pumps
// =====================

const pumps = await Pump.insertMany([

{
    pumpNumber:"PUMP-001",
    station:station._id,
    active:true,
    pistols:[
        {
            pistolNumber:1,
            product:products[0]._id,
            currentClosingIndex:0,
            active:true
        },
        {
            pistolNumber:2,
            product:products[1]._id,
            currentClosingIndex:0,
            active:true
        }
    ]
},

{
    pumpNumber:"PUMP-002",
    station:station._id,
    active:true,
    pistols:[
        {
            pistolNumber:1,
            product:products[0]._id,
            currentClosingIndex:0,
            active:true
        },
        {
            pistolNumber:2,
            product:products[1]._id,
            currentClosingIndex:0,
            active:true
        }
    ]
}

]);


console.log("Pumps created");



// =====================
// User
// =====================

// Note: Password is passed as plain text. The User model's pre('save') hook
// will automatically hash it using bcrypt.

await User.create({

username:"admin",

email:"admin@fuelstation.com",

password:"Admin@123",

role:"ADMIN",

firstName:"System",

lastName:"Administrator",

active:true,

station:station._id

});


console.log("Admin created");



// =====================
// Tanks
// =====================

const tanks = await Tank.insertMany([

{
    station:station._id,
    product:products[0]._id,
    tankNumber:"TANK-001",
    capacity:20000,
    currentStock:15000,
    minLevelAlert:2000,
    active:true
},

{
    station:station._id,
    product:products[1]._id,
    tankNumber:"TANK-002",
    capacity:20000,
    currentStock:12000,
    minLevelAlert:2000,
    active:true
}

]);


console.log("Tanks created");






console.log("SEED DONE");


process.exit();


}catch(error: any){

console.log(error);

process.exit(1);

}


}


seed();