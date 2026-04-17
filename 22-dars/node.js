const fs = require('fs')

fs.readFile('./file.txt', 'utf-8', (err, data) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(data);
});

// fs.writeFile('./file.txt', 'Men file ichiga yozayabman...', (err) => {
//     if (err) {
//         console.log(err)
//         return;
//     }
// })

fs.appendFile('./file.txt', 'Men buni davomidan yozayabman', (err) => {
    if (err) {
        console.log(err);
        return;
    }
})


// function addUser(user){
//     fs.readFile('./users.json', 'utf-8', (err, data) => {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         let users = JSON.parse(data);
//         users.push(user);
//         console.log(users);
//         fs.writeFile('./users.json', JSON.stringify(users, null, 2), (err) => {
//             if (err) {
//                 console.log(err);
//                 return;
//             }
//         })
//     })
// }

// let user = {
//     name: 'Ali',
//     surname: 'Aliyev',
//     age: 25
// }

// addUser(user)