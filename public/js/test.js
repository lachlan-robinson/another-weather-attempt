const container = document.getElementById("hour-container");
// where "container" is the id of the container
container.addEventListener("wheel", function (e) {
    if (e.deltaY > 0) {
        container.scrollLeft += 1000;
        e.preventDefault();
        // prevenDefault() will help avoid worrisome
        // inclusion of vertical scroll
    } else {
        container.scrollLeft -= 1000;
        e.preventDefault();
    }
});

container.style.scrollBehavior = "smooth";
// That will work perfectly

switch (desc) {
    case "clear sky":
        path = "/img/sun.png";
        break;
    case "few clouds":
        path = "/img/fewcloud-d.png";
        break;
    case "scattered clouds":
        path = "/img/cloud.png";
        break;
    case "broken clouds":
        path = "/img/cloud.png";
        break;
    case "shower rain":
        path = "/img/shower.png";
        break;
    case "rain":
        path = "/img/rain.png";
        break;
    case "thunderstorm":
        path = "/img/thunder.png";
        break;
    case "snow":
        path = "/img/snow.png";
        break;
    case "mist":
        path = "/img/mist.png";
        break;
    default:
        break;
}
