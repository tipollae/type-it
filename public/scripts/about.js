const loadingElement = document.getElementById("frontPageLoader");
const fakeConsoleContainer = document.getElementById("fakeConsoleContainer");
const fakeConsole = document.getElementById("fakeConsole");

function stopLoading(){

    setTimeout(()=>{

        loadingElement.style.display = "none";

        fakeConsoleContainer.style.visibility = "visible";
        fakeConsoleContainer.style.opacity = 1;

    }, 2500)

}