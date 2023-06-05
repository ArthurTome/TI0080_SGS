function NigthMode(event) {
  var checked = document.getElementById("nigth_check").checked;
  if (checked) {
    //var color = "rgb(" + 125 + ", " + 125 + ", " + 125 + ")";
    //document.body.style.backgroundColor = color;
    document.getElementById('color_sch').setAttribute('href','css/color_b.css');
  } else {
    //var color = "rgb(" + 255 + ", " + 255 + ", " + 255 + ")";
    //document.body.style.backgroundColor = color;
    document.getElementById('color_sch').setAttribute('href','css/color_d.css');
  }
};