var button = document.getElementById("produtos");
var menu = document.querySelector(".hidden-menu");

button.addEventListener("mouseenter", function () {
  menu.style.display = "block";
});

menu.addEventListener("mouseleave", function () {
  menu.style.display = "none";
});

function NigthMode(event) {
  var checked = document.getElementById("nigth_check").checked;
  if (checked) {
    var color = "rgb(" + 125 + ", " + 125 + ", " + 125 + ")";
    document.body.style.backgroundColor = color;
  } else {
    var color = "rgb(" + 255 + ", " + 255 + ", " + 255 + ")";
    document.body.style.backgroundColor = color;
  }
};

function aumentarTamanho() {
  var objeto = document.getElementById("header_index");
  var width = objeto.offsetWidth;
  var height = objeto.offsetHeight;
  var tex1 = document.getElementById("header_text", "footer");
  //var tex2 = document.getElementsByClassName("social_icons");
  var fontSize = parseInt(window.getComputedStyle(tex1).fontSize);
  //var fontSize2 = parseInt(window.getComputedStyle(tex2).fontSize);

  //objeto.style.width = (width + 10) + "px";
  objeto.style.height = height + 10 + "px";
  tex1.style.fontSize = fontSize + 2 + "px";


};


function diminuirTamanho() {
  var objeto = document.getElementById("header_index");
  var width = objeto.offsetWidth;
  var height = objeto.offsetHeight;
  var tex1 = document.getElementById("header_text", "footer");
  //var tex2 = document.getElementsByClassName("social_icons");
  var fontSize = parseInt(window.getComputedStyle(tex1).fontSize);
  
  objeto.style.height = height - 10 + "px";
  tex1.style.fontSize = fontSize - 2 + "px";
  
};
