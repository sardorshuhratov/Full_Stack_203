// Qoshilgan maxsulotlardan chegirma qilish

// function finalResult(array) {
//     let totalPrice = 0;
//     let discount = 0;

//     for (const item of array) {
//         totalPrice += item;
//     }

//     if (array.length >= 3 && array.length < 5) {
//         discount = 10;
//     }

//     if (array.length > 5) {
//         discount = 20;
//     }

//     return {
//         totalPrice:totalPrice,
//         discount:discount,
//         finalPrice:totalPrice - totalPrice * discount / 100
//     }
// };

// let result = finalResult([20, 50, 60, 40])
// console.log(result);


// 2-masala
// Bankomatdan pul yechish tizimi $130 → 1 ta $100, 1 ta $20, 1 ta $10
// Agar so‘ralgan summa 10 ga karrali bo‘lmasa → xatolik qaytarilsin
// kupyura=[100,50,20,10];
// result={
//     100:1,
//     20:1,
//     10:1
// }

// function withDraw(amount) {

//     if (amount % 10 !== 0) {
//         return "Xatolik! Notog'ri summa kiritilgan!"
//     }

//     let kupyura = [100, 50, 20, 10, 5];
//     let result = {};

//     for (let i = 0; i < kupyura.length; i++) {
//         let count = Math.floor(amount / kupyura[1]);
//         if (count > 0) {
//             result[kupyura[i]] = count;
//             amount -= count * kupyura[i];
//         }
//     }

//     return result;
// }

// let result = withDraw(130);
// console.log(result);


// 3-masala
// BankAccount nomli funksiya yarating, u quyidagi metodlarga ega obyekt qaytarsin:

// Pul qo‘shish (deposit)

// Pul yechish (withdraw) — faqat balans yetarli bo‘lsa

// Balansni ko‘rish (view balance)


// function BankAccount() {
//     let balance = 0;

//     return {
//         deposit: function (amount) {
//             balance += amount;
//             return balance;
//         },
//         withdraw: function (amount) {
//             if (balance >= amount) {
//                 balance -= amount;
//                 return balance
//             }
//         },
//         viewBalance: function () {
//             return balance;
//         }
//     }
// }

// let account = BankAccount();
// account.deposit(1000);
// account.withdraw(500);
// console.log(account.viewBalance());


// 4-masala – Dinamik soliq kalkulyatori (Dynamic Tax Calculator)

// Oylik daromadga qarab soliqni hisoblaydigan funksiya yarating.

// Shartlar:

// $10,000 dan kam → soliq yo‘q

// $10,000 – $50,000 → 10% soliq; qaytarsin: taxSum, salaryAfterTax summa

// $50,000 dan yuqori → 20% soliq

// result={
//     brutto:10000,
//     taxPercent:10,
//     netto:9000
// }

// // 5 Talabalar reyting tizmi (funksiyalar bilan ishlaymiz)


// calculateAverage(scores) → talabalar o‘rtacha ballarini

// getFinalGrade(avgScore, attendance) → yakuniy baho (masalan: agar avg ≥ 85 va attendance ≥ 90 → "A", 75-84 → "B" va h.k.)

// addNewStudent(student)

// findTopStudent(students) → eng yuqori o‘rtacha + davomat ko‘rsatkichi bo‘yicha top talabani topadi

// getGroupStats(students, groupName) → guruh bo‘yicha o‘rtacha ball va o‘rtacha davomatni qaytaradi

// const students = [
//   { id: 1, fullName: "Aliyev Sardor", group: "Frontend-21", scores: [85, 92, 78, 95, 88], attendance: 92 },
//   { id: 2, fullName: "Karimova Madina", group: "Backend-22", scores: [65, 72, 58, 80, 69], attendance: 78 },
//   { id: 3, fullName: "Rasulov Bekzod", group: "Frontend-21", scores: [90, 88, 84, 91, 87], attendance: 95 },
//   { id: 4, fullName: "Tursunova Dilnoza", group: "Backend-22", scores: [70, 75, 68, 72, 74], attendance: 82 },
//   { id: 5, fullName: "Qodirov Javohir", group: "Frontend-21", scores: [88, 90, 92, 85, 87], attendance: 89 },
//   { id: 6, fullName: "Ismoilova Zarnigor", group: "Backend-22", scores: [60, 65, 63, 58, 62], attendance: 70 },
//   { id: 7, fullName: "Abdullayev Diyor", group: "Frontend-21", scores: [95, 93, 97, 96, 94], attendance: 98 },
//   { id: 8, fullName: "Yusupova Mohira", group: "Backend-22", scores: [78, 82, 80, 76, 79], attendance: 85 },
//   { id: 9, fullName: "Rahmatov Aziz", group: "Frontend-21", scores: [55, 60, 58, 62, 57], attendance: 65 },
//   { id: 10, fullName: "Saidova Nilufar", group: "Backend-22", scores: [88, 85, 90, 87, 89], attendance: 91 }
// ];

// function findByName(fullName) {
//   for (const student of students) {
//     if (student.fullName === fullName) {
//       return student;
//     }
//   }
//   return null;
// };

// function calculateAverage(scores) {
//   let sum = 0;
//   for (const score of scores) {
//     sum += score;
//   }
//   return sum / scores.length;
// };

// function addNewStudent(student) {
//   students.push(student);
//   return students;
// };

// function findTopStudent(students) {
//   let topStudent = null;
//   let maxAvg = 0;
//   let maxAttendance = 0;

//   for (const student of students) {
//     const avg = calculateAverage(student.scores);
//     if (avg > maxAvg && student.attendance > maxAttendance) {
//       topStudent = student;
//       maxAvg = avg;
//       maxAttendance = student.attendance;
//     }
//   }

//   return topStudent;
// };

// function getGroupStats(students, groupName) {
//   let groupStudents = [];
//   let sumScores = 0;
//   let sumAttendance = 0;
//   let count = 0;
//   for (const student of students) {
//     if (student.group === groupName) {
//       groupStudents.push(student);
//       sumScores += calculateAverage(student.scores);
//       sumAttendance += student.attendance;
//       count++;
//     }
//   }
//   const avgScores = sumScores / count;
//   const avgAttendance = sumAttendance / count;
//   return { avgScores, avgAttendance };
// };

// console.log(findByName("Rahmatov Aziz"));
// console.log(calculateAverage([85, 92, 78, 95, 88]));
// console.log(addNewStudent({ id: 11, fullName: "Qodirov Javohir", group: "Frontend-21", scores: [88, 90, 92, 85, 87], attendance: 89 }));
// console.log(findTopStudent(students));
// console.log(getGroupStats(students, "Frontend-21"));




