// let obj = [{
//     nmae: "Sardor",
//     surname: "Shuhratov",
//     age: 20,
//     iaMarried: false
// }];

// let objJson = JSON.stringify(obj);
// console.log(objJson);

// let objObject = JSON.parse(objJson);
// console.log(objObject);

// localStorage.setItem("name1", "Sardor");
// localStorage.setItem("surname", "Abrorbek");
// localStorage.setItem("age", "22")
// let name1 = localStorage.getItem("name1");
// let surname = localStorage.getItem("surname");
// let age = localStorage.getItem("age");
// console.log(name1);
// console.log(surname);
// console.log(age);
// localStorage.removeItem('name1');

// localStorage.clear();

function setTheme(theme) {
        console.log(theme);
       if (theme === 'dark') {
            document.body.classList.remove('light');
            document.body.classList.add('theme');
       } else {
            document.body.classList.remove('dark');
            document.body.classList.add('theme');
       }
       localStorage.setItem('theme', theme);
};

let savedTheme = localStorage.getItem('theme');
if (savedTheme) {
       setTheme(savedTheme);
} else {
       setTheme('light');
};
document.body.classList.add(savedTheme);