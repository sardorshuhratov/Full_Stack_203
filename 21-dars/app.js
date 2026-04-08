// function fileUpload(callback) {
//     let isUploded = true;
//     setTimeout(() => {
//         if (isUploded) {
//             callback(null, "Fayl yuklandi");
//         } else {
//             callback(null, "serverda xatolik");
//         }
// }, 2000)
// }

// fileUpload(function(message, error) {
//     if (error) {
//         console.log(error);
//         return;
//     }
// });

// let vada = new Promise(function(resolve, reject) {
//     let finished = true;
//     setTimeout(() => {
//         if (finished) {
//             resolve("Vada bajarildi");
//         } else {
//             reject("Vadasida turmadi");
//         }
//     }, 1500);
// });

// vada 
//     .then((success) => {
//         console.log(success);
//     })
//     .catch((error) => {
//         console.log(error);
//     })
//     .finally(() => console.log("Vada bajarilishi tugadi"));


function uploadFile(file) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (file) {
                resolve("File yuklandi");
            } else {
                reject("File yuborilmadi");
            }
        }, 2000);
    });
}

async function userFile() {
    try {
        let result = await uploadFile();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

function renderPosts() {
    const usersBox = document.getElementById("users");

    fetch("https://jsonplaceholder.typicode.com/posts")
        .then((data) => data.json())
        .then((posts) => {
            let html = "";

            posts.forEach((post) => {
                html += `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <span class="badge text-bg-primary mb-3">Post #${post.id}</span>
                        <h2 class="h5 card-title text-capitalize mb-3">${post.title}</h2>
                        <p class="card-text mb-3">${post.body}</p>
                        <p class="card-text mb-0"><strong>User ID:</strong> ${post.userId}</p>
                    </div>
                </div>
            </div>
            `;
            });

            usersBox.innerHTML = html;
        })
        .catch((error) => {
            console.log(error);
            usersBox.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    Ma'lumotlarni yuklashda xatolik yuz berdi.
                </div>
            </div>`;
        })
        .finally(() => console.log("Vazifa bajarildi"));
}

renderPosts();
