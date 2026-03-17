// function talabaYaratish(ism, ball, yosh, gurux) {
//     return {
//         ism: ism,
//         ball: ball,
//         yosh: yosh,
//         gurux: gurux,
//         baholash() {
//             ball >= 50 ? "O'tdi" : "O'tmadi";
//         },
//         isAdult() {
//             return yosh >= 18 ? "Kattalar" : "Bolalar";
//         }
//     }
// }
// let talaba1 = talabaYaratish("Ali", 75, 20, "A");
// let talaba2 = talabaYaratish("Vali", 45, 17, "B");
// console.log(talaba1);
// console.log(talaba2);
// console.log(talaba1.baholash());
// console.log(talaba1.isAdult());
// console.log(talaba2.baholash());
// console.log(talaba2.isAdult());

// function mashina(markasi, modeli, yili) {
//     this.markasi = markasi;
//     this.modeli = modeli;
//     this.yili = yili;
//     this.malumot = function() {
//         return `Mashina: ${this.markasi} ${this.modeli}, Yili: ${this.yili}`;
//     }
// }

// let mashina1 = new mashina("Chevrolet", "Malibu", 2025);
// let mashina2 = new mashina("Toyota", "Camry", 2019);
// console.log("\n=================================\n");
// console.log(mashina1.malumot());
// console.log(mashina2.malumot());
// console.log("\n=================================\n");

// class Person {
//     constructor(name, surname, age) {
//         this.name = name;
//         this.surname = surname;
//         this.age = age;
//     }
//     isAdult() {
//             console.log(this.age >= 18 ? "Voyaga yetgan" : "Voyaga yetmagan");
//     };
// }

// let person1 = new Person ("Ali", "Valiyev", 18);
// console.log(person1)
// person1.isAdult();

class Bank {
    constructor(name,balance,password) {
        this.name = name;
        this.balance = balance;
        this.password = password;
    }
    pul_kiritish(pul,password) {
        if (password != this.password) {
            console.log("Parol xato!");
            return;
        }
        this.balance += pul;
        console.log(`${pul} so'm pul kiritildi, BALANCE: ${this.balance}`);
    };
    pul_chiqarish(pul,password) {
        if (password != this.password) {
            console.log("Parol xato!");
            return;
        };
        if (this.balance < pul) {
            console.log("Mablag' yetarli emas!");
            return;
        } else {
            this.balance -= pul;
            console.log(`${pul} so'm pul chiqarildi, BALANCE: ${this.balance}`);
        }
    }

};

let odam = new Bank("Ali", 5600, 1311);
console.log(odam);
odam.pul_kiritish(2500000,1311);
odam.pul_chiqarish(2499000,1311); 