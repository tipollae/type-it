
const loadingElement = document.getElementById("frontPageLoader");
const fakeConsoleContainer = document.getElementById("fakeConsoleContainer");
const fakeConsole = document.getElementById("fakeConsole");
const usernameInput = document.getElementById("usernameInput");
const createRoomBlurr = document.getElementById("createRoomBlurr");

let messageTimeout = null;
let isPaused = false;

socket.on('disconnect', ()=>{
    displayMessage("You have been disconnected from the server", "red")
    setTimeout(()=>{location.reload()}, 600);
});


socket.on("invalid-token", ()=>{

    displayMessage("Invalid token", "red")
    setTimeout(()=>{window.location = "../"}, 600);

})

socket.on("failed-creating-room", ()=>{

    displayMessage("You can only own 3 rooms at a time", "red");
    isPaused = true;
    createRoomBlurr.style.display = "none";
    buttons[1].classList.remove("active")
    buttons[0].classList.add("active")

})

socket.on("existing-token", ()=>{

    displayMessage("Logged in!", "#00C400")

    setTimeout(()=>{

        loadingElement.style.display = "none";

        fakeConsoleContainer.style.visibility = "visible";
        fakeConsoleContainer.style.opacity = 1;

        const line = document.createElement("div");
        line.textContent = `Welcome, ${localUsername}.`;
        fakeConsole.appendChild(line);

        setTimeout(()=>{

            inputUser("Enter a room code: ");

        }, 1200)

    }, 1500)

})

socket.on("invalid-room", (givenMsg)=>{

    displayMessage("Invalid room", "red")

    const br = document.createElement("br");
    fakeConsole.appendChild(br)

    const line = document.createElement("div");
    line.textContent = givenMsg;
    fakeConsole.appendChild(line);

    inputUser("Enter a room code: ");

})

socket.on("valid-room", (givenRoomCode)=>{

    displayMessage("Room found!", "#00C400")
    window.location = `/code#${givenRoomCode}`

})

function inputUser(text){

    isPaused = true;
    const prompt = document.createElement("div");
    prompt.classList.add("consoleDiv")
    const input = document.createElement("input");
    input.classList.add("consoleInputs")
    const br = document.createElement("br")

    prompt.textContent = text;
    input.enterKeyHint = "done";
    input.autocomplete = "off";
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

function createRoomPrompt(){

    isPaused = false;
    createRoomBlurr.style.display = "block";
    
    
    setTimeout(()=>socket.emit("create-room"), 1200)

}

function logOutPrompt(){

    socket.emit("log-user-out");
    localStorage.clear();

}

function displayMessage(message, color){

    const msgDisplay = document.getElementById("messageDisplay");

    msgDisplay.innerHTML = `<center>${message}</center>`;
    msgDisplay.style.backgroundColor = color;
    msgDisplay.style.display = "block";
    const TIME = 2500;

    if (messageTimeout === null){

        messageTimeout = setTimeout(function(){

            msgDisplay.innerHTML = "";
            msgDisplay.style.display = "none";

        }, TIME)

    }

    else{

        clearTimeout(messageTimeout);
        messageTimeout = null;
        messageTimeout = setTimeout(function(){

            msgDisplay.innerHTML = "";
            msgDisplay.style.display = "none";

        }, TIME);

    }

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
        line.textContent = "Searching room...";
        fakeConsole.appendChild(line);

        socket.emit("join-room", inputValue);
        console.log(`input value: ${inputValue}`);

        isPaused = false;

    }
});