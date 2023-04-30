
var button = document.getElementById("produtos");
var menu = document.querySelector(".hidden-menu");

button.addEventListener("mouseenter", function() {
  menu.style.display = "block";
});

menu.addEventListener("mouseleave", function() {
  menu.style.display = "none";
});
