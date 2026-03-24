let textClass = document.getElementsByClassName("text");
console.log(textClass);
textClass[1].computedStyleMap.color = "red";

let h1 = document.getElementsByTagName("h1");
console.log(h1);
h1[0].style.color = "blue";
h1[0].style.backgroundColor = "yellow";

let p1 = document.querySelector(".box p");
console.log(p1);
p1.style.color = "green";
p1.style.backgroundColor = "pink";

