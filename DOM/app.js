const textElements = document.querySelectorAll(".text");
if (textElements[1]) {
  textElements[1].style.color = "red";
}

const headings = document.querySelectorAll("h1");
if (headings[0]) {
  headings[0].style.color = "blue";
  headings[0].style.backgroundColor = "yellow";
}

const p1 = document.querySelector(".box p");
if (p1) {
  p1.style.color = "green";
  p1.style.backgroundColor = "pink";
}
