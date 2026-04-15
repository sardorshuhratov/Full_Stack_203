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

// fs.appendFile('./file.txt', 'Men buni davomidan yozayabman', (err) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
// })

