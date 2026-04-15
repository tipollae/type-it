
const loadingElement = document.getElementById("frontPageLoader");
const fakeConsoleContainer = document.getElementById("fakeConsoleContainer");
const fakeConsole = document.getElementById("fakeConsole");
const usernameInput = document.getElementById("usernameInput");
let isPaused = false;

socket.on("invalid-token", ()=>{

    setTimeout(()=>{

        loadingElement.style.display = "none";

        fakeConsoleContainer.style.visibility = "visible";
        fakeConsoleContainer.style.opacity = 1;

        inputUser("Enter a username: ");

    }, 2500)

})

socket.on("existing-token", ()=>{

    setTimeout(()=>{

        window.location = "rooms.html"

    }, 400)

})

socket.on("invalid-username", (message)=>{

    const line = document.createElement("div");
    line.textContent = message;
    fakeConsole.appendChild(line);

    inputUser("Enter a username: ")

})

socket.on("valid-username", (message, tokenID, username)=>{

    const line = document.createElement("div");
    line.textContent = message;
    fakeConsole.appendChild(line);

    localStorage.setItem("token", tokenID);
    localStorage.setItem("username", username)

    setTimeout(()=>{

        const line2 = document.createElement("div");
        line2.textContent = "Entering...";
        fakeConsole.appendChild(line2);

        setTimeout(()=>{

            window.location = "rooms.html"

        }, 500)

    }, 800);

})

function inputUser(text){

    isPaused = true;
    const prompt = document.createElement("div");
    prompt.classList.add("consoleDiv")
    const input = document.createElement("input");
    input.classList.add("consoleInputs")
    const br = document.createElement("br")

    prompt.textContent = text;
    prompt.appendChild(input);

    fakeConsole.appendChild(br)
    fakeConsole.appendChild(prompt);

    input.focus();

}

function focusInput(){

    const consoleInputs = document.getElementsByClassName("consoleInputs");
    const foundInput = consoleInputs[consoleInputs.length - 1];
    if (foundInput) foundInput.focus();

}

document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  
    if (keyName === 'Enter' && isPaused) {

        const consoleInputs = document.getElementsByClassName("consoleInputs");
        const inputValue = consoleInputs[consoleInputs.length - 1].value;
        const consoleDiv = document.getElementsByClassName("consoleDiv");  
        consoleInputs[consoleInputs.length - 1].remove();

        consoleDiv[consoleDiv.length-1].textContent += inputValue;
        
        const line = document.createElement("div");
        line.textContent = "Validating input...";
        fakeConsole.appendChild(line)

        socket.emit("create-user", String(inputValue))
        console.log(`input value: ${inputValue}`)

        isPaused = false;

    }
});