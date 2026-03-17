// Object literal ({})

// 1. Object yaratish
// let car = {
//     brand: "Toyota",
//     model: "Camry",
//     price: 25000,
//     year: 2015,
//     color: "red",
//     start: function() {
//         console.log("Car is starting...");
//     }
// }
// console.log("Brand: " + car.brand + 
//     "\nModeli: " + car.model + 
//     "\nNarx: " +  car.price +
//     "\nYear: " + car.year +
//      "\nRangi: " +car.color);
// car.start();

// // 2. Object yaratish (new Object())
// let person = new Object();
// person.name = "John";
// person.age = 30;
// person.greet = function() {
//     console.log(`\nHello, my name is ${this.name}  and I am ${this.age} years old.\n`);
// }
// console.log("Name: " + person.name + "\nAge: " + person.age);
// person.greet();

// // 3. Object yaratish (constructor function)
// function Person(name, age) {
//     this.name = name;
//     this.age = age;
//     this.greet = function() {
//         console.log(`\nHello, my name is ${this.name}  and I am ${this.age} years old.\n`);
//     }
// }
// let person1 = new Person("Alice", 25);
// let person2 = new Person("Bob", 35);
// console.log("Name: " + person1.name + "\nAge: " + person1.age);
// person1.greet();
// console.log("Name: " + person2.name + "\nAge: " + person2.age);
// person2.greet();

// // 4.
// function crateCar(brand, year, price) {
//     return {
//         brand,
//         year,
//         price,
//         getInfo: function() {
//             return `Brand: ${this.brand}, Year: ${this.year}, Price: ${this.price}`;
//         }
// }
// };
// let car1 = crateCar("Nexia", 2010, 5000);
// let car2 = crateCar("Cobalt", 2015, 8000);
// console.log(car1.getInfo());
// console.log(car2.getInfo());

// // 5. Constructor function
// function Person(name, age, city) {
//     this.name = name;
//     this.age = age;
//     this.city = city;
//     this.getInfo = function() {
//         return `\nHi! My name is ${this.name}, I am ${this.age} years old and I live in ${this.city}.`;
//     }
// };
// let person1 = new Person("Ali", 20, "KOkand");
// let person2 = new Person("Vali", 25, "Andijan\n");
// console.log(person1.getInfo());
// console.log(person2.getInfo());

// // 6.Object.create() metodi
// let animal = {
//     type: "Mammal",
//     mmakeSound: function() {
//         return console.log("Animal makes a sound.");
//     }
// };

// let dog = Object.create(animal);
// dog.name = "Buddy";
// dog.breed = "Golden Retriever";
// console.log("Name: " + dog.name + "\nBreed: " + dog.breed + "\nType: " + dog.type);
// dog.mmakeSound();

// // 7. ES6 Class sintaksisi
// class Person {
//     constructor(name, age, city) {
//         this.name = name;
//         this.age = age;
//         this.city = city;
//     }
//     greet() {
//         return `Hi! My name is ${this.name}, I am ${this.age} years old and i live in ${this.city}`;
//     }

// };

// let person = new Person("Ali", 23, "Frg'ona");
// console.log(person.greet()); 

// 8. Singleton Object (Object.freeze())
const config = {
    apiUrl: "https://api.example.com",
    apiKey: "xyz123abc"
};

// Ob'ektni muzlatamiz
Object.freeze(config);

// Endi bu ob'ektni o'zgartirib bo'lmaydi.
// Har qanday o'zgartirishga urinish e'tiborga olinmaydi (strict mode'da xatolik beradi).

console.log("Original API Key:", config.apiKey);

// Qiymatni o'zgartirishga urinish
config.apiKey = "newKey456";
console.log("After trying to change API Key:", config.apiKey); // Qiymat o'zgarmaydi

// Yangi xususiyat qo'shishga urinish
config.timeout = 5000;
console.log("After trying to add timeout:", config.timeout); // undefined, xususiyat qo'shilmaydi

console.log(config); // Ob'ekt o'zgarishsiz qolganini ko'rsatish
