// const prompt = require("prompt-sync")();

// let name = prompt("Ismingni kiriting: ");
// console.log("Salom " + name);

// let sonlar = [1,2,3,4,5,6,7];

// sonlar.pop();

// console.log(sonlar);

// Metod	    Vazifa
// push()	    oxiriga qo‘shadi
// pop()	    oxiridan o‘chiradi
// shift()	    boshidan o‘chiradi
// unshift()	boshiga qo‘shadi
// length	    uzunligini beradi


// let matrix = [
//     [1,2,3],
//     [4,5,6],
//     [7,8,9]
// ];

// for(let i = 0; i < matrix.length; i++){
//     for(let j = 0; j < matrix[i].length; j++){
//         console.log(matrix[i][j]);
//     }
// }

// let sonlar = [1,2,3,4,5];
// sonlar.forEach(function(son){
//     console.log(son);
// });

// 6

// function capitalizeFirstLetter(str) {
//     return str.charAt(0).toUpperCase() + str.slice(1);
// }

// let names = ["ali"];
// console.log(capitalizeFirstLetter(names[0]));

// // 1.
// let friends = new Array(5);
// friends[0] = "Ali";
// friends[1] = "Vali";
// friends[2] = "Hasan";
// friends[3] = "Husan";
// friends[4] = "Olim";
// console.log(friends);

// // 2.
// let colors = ["qizil", "yashil", "ko'k", "sariq", "qora"];
// console.log(colors);

// // 3
// let copyColors = ["pushti", ...colors, "oq"];
// console.log(copyColors);

// // 4
// let obj = {
//     name: "Ali",
//     age: 25,
//     city: "Toshkent"
// };
// let copyObj = {...obj, country: "Uzbekistan"};
// console.log(copyObj);

// // 5
// console.log(new Set([1,2,3,4,5,5,4,3,2]));
// let setArray = [...new Set([1,2,3,4,5,5,4,3,2])];
// console.log(setArray);

// // 7
// function capitalizeFirstLetter(name) {
//     let result = name.slice(0,1).toUpperCase() + name.slice(1);
//     return result;
// }
// console.log(capitalizeFirstLetter("ali"));

// // 8
// let numbers = Array.of(5, "salom", true, null);
// console.log(numbers);

// // 9
// let numbers = [1,2,3,4,5];
// // numbers.push(6);
// // numbers.unshift(0);
// // numbers.pop();
// // numbers.shift();
// numbers.splice(1, 2, 10);
// numbers[5] = "salom";
// console.log(numbers);
// console.log(numbers.length);

// // 10

// let numbers = [1,2,3,4,5,6];
// let result = numbers.splice(0, 4);
// console.log(result);
// console.log(numbers.concat([11, 22, 33]));
// console.log(numbers.join("-"));
// let array  = [1,[2,[5]]];
// console.log(array.flat(2));
// console.log(numbers.indexOf(3));
// console.log(numbers.includes(6));

// console.log(numbers.find((num) => {return num > 3}));
// console.log(numbers.findIndex((num) => {return num > 3}));
// console.log(numbers.some((num) => {return num < 0}));
// console.log(numbers.every((num) => {return num > 0}));

// console.log(numbers.map((num) => {return num * 2}));
// console.log(numbers.filter((num) => {return num % 2 === 0}));

// // 11
// color = ["qizil", "yashil", "ko'k", "sariq", "qora"];
// console.log(color.reduce((acc, num) => {return acc + num}));

// // 12
// let numbers = [1,2,3,4,5,6,-9,-8,-7];
// let result = numbers.forEach((num) => {
//     console.log(num);
// });
// console.log(result);
// let resultNumbers = numbers.map((num) => num ** 2);
// console.log(resultNumbers);
// console.log(numbers);
// numbers.reverse();
// console.log(numbers);
// console.log(numbers.sort((a, b) => a - b));
// console.log(numbers.fill(0, 2, 5));

// 13

let products = [
    {
        name: "Iphone 8",
        price: 500
    },

    { 
        name: "Samsung Galaxy S10",
        price: 700
    },
    
    {
        name: "Xiaomi Mi 9",
        price: 300
    },

    {
        name: "OnePlus 7 Pro",
        price: 600
    },

    {
        name: "Iphone 11 pro",
        price: 500
    },

    {
        name: "Iphone 15 Pro Max",
        price: 1200
    }
];

function filterProducts (minprice, maxprice) {
    return products.filter((product) => {
        return product.price >= minprice && product.price <= maxprice;
    });
}
console.log(filterProducts(200, 700));