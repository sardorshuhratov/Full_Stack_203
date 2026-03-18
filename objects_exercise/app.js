// let products = [
//     {
//         id: 1,
//         name: "Banan",
//         price: 21000,
//         stock: 25
//     },
//     {
//         id: 2,
//         name: "Olma (Golden)",
//         price: 22000,
//         stock: 30
//     },
//     {
//         id: 3,
//         name: "Nok",
//         price: 19000,
//         stock: 28
//     },
//     {
//         id: 4,
//         name: "Anor",
//         price: 30000,
//         stock: 100
//     },
// ];

// // Omborxonaga maxsulot qoshish
// class Products {
//     constructor(products) {
//         this.products = products;
//     }

//     newId() {
//         let maxId = 0;
//         for (let i = 0; i < this.products.length; i++) {
//             if (this.products[i].id > maxId) {
//                 maxId = this.products[i].id;
//             }
//         }
//         return maxId + 1;
//     }

//     addProduct(products) {
//         let newProduct = {
//             ...products,
//             id: this.newId()
//         };
//         this.products.push(newProduct);
//         console.log(`${newProduct.name} omborga qoshildi`);
//     }
//     updateStock(id, stock) {
//         let product = this.products.find(product => product.id == id);
//         product.stock = stock;
//         console.log(`${product.name} stock soni ${stock} ga yangilandi!`);
//     }
//     deleteProduct(id){
//         let product = this.products.find(product => product.id == id);
//         let index = this.products.indexOf(product);
//         this.products.splice(index, 1);
//         console.log(`${product.name} nomli maxsulot o'chirildi!`);
//     }
//     findProduct(id) {
//         let product = this.products.find(product => product.id == id);
//         console.log(product);
//     }
// };

let users = [
    {
        id: 1,
        full_name: "Ali Valiyev",
        email: "validator01@gmail,com",
        password: "11223344"
    },
    {
        id: 2,
        full_name: "Jalil Aliyev",
        email: "jalil07@gmail,com",
        password: "44332211"
    },
    {
        id: 3,
        full_name: "Vali Aliyev",
        email: "valibek@gmail,com",
        password: "12345678"
    }
]

