const fs = require('fs');
const { get } = require('http');
const path = require('path');

let file = path.join(__dirname, 'users.json');

function getUsers() {
    try {
        let users = fs.readFileSync(file, 'utf-8');
        let usersArray = JSON.parse(users)
        return usersArray;
    } catch (error) {
        console.log(error);

    }
}
// getUsers();

function getUserById(id) {
    try {
        let users = fs.readFileSync(file, 'utf-8');
        let usersArray = JSON.parse(users);
        let user = usersArray.find(user => user.id === id);
        console.log(user);
        return user;
    } catch (error) {
        console.log(error);
    }
}
// getUserById(5);


// countrylarni olish
// Json fileni o’qib userlarni country(davlatlarni) qaytarsin(davlatlar takrorlanmasin)

function getUserCountries() {
    try {
        let users = fs.readFileSync(file, 'utf-8');
        let usersArray = JSON.parse(users);
        let countries = [...new Set(usersArray.map(user => user.country))];
        console.log(countries);
        return countries;
    } catch (error) {
        console.log(error);
    }
}
// getUserCountries();

// country bo’yicha userlarni olish
function getUsersByCountry(country) {
    try {
        let users = fs.readFileSync(file, 'utf-8');
        let usersArray = JSON.parse(users);
        let usersByCountry = usersArray.filter(user => user.country.toLowerCase() === country.toLowerCase());
        console.log(usersByCountry);
        return usersByCountry;
    } catch (error) {
        console.log(error);
    }
}
// getUsersByCountry("O'zbekiston");
// getUsersByCountry("aQSh");

// country bo’yicha userlarni olish va ularni yosh bo’yicha tartiblash
function getUsersByGender(gender) {
    try {
        let users = fs.readFileSync(file, 'utf-8');
        let usersArray = JSON.parse(users);
        let usersByGender = usersArray.filter(user => user.gender.toLowerCase() === gender.toLowerCase());
        console.log(usersByGender);
        return usersByGender;
    } catch (error) {
        console.log(error);
    }

}
// getUsersByGender("Erkak");


function addUser(user) {
    try {
        let users = fs.readFileSync(file, 'utf-8');
        let usersArray = JSON.parse(users);
        usersArray.push(user);
        fs.writeFileSync(file, JSON.stringify(usersArray, null, 2));
        console.log(usersArray);
        console.log("User added successfully");
        return usersArray;
    } catch (error) {
        console.log(error);
    }
}
addUser({
    "name": "Ali",
    "age": 30,
    "country": "O'zbekiston",
    "gender": "Erkak"
});      
