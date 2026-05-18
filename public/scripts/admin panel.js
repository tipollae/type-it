
const socket = io();

const loadingElement = document.getElementById("frontPageLoader");
const fakeConsoleContainer = document.getElementById("fakeConsoleContainer");
const fakeConsole = document.getElementById("fakeConsole");
const usernameInput = document.getElementById("usernameInput");
const createRoomBlurr = document.getElementById("createRoomBlurr");
const panelDisplay = document.getElementById("panelDisplay");
const roomsDisplay = document.getElementById("roomsDisplay");

const usersLength = document.getElementById("usersLength");
const roomsLength = document.getElementById("roomsLength");

let messageTimeout = null;
let isPaused = false;

setTimeout(()=>{

    loadingElement.style.display = "none";

    fakeConsoleContainer.style.visibility = "visible";
    fakeConsoleContainer.style.opacity = 1;

    displayLine("IMPORTANT:");
    displayLine("-----------------");
    displayLine("Restricted Access");
    displayLine("-----------------");
    displayLine("This panel is intended for authorized administrators only. Unauthorized access attempts may be logged and monitored.");

    setTimeout(()=>{

        inputUser("Enter admin password: ");

    }, 1200)

}, 1500)

socket.on("invalid-access", ()=>{

    displayMessage("Invalid password", "red")
    setTimeout(()=>{

        window.location = "../"

    }, 1000)

})

socket.on("valid-access", ()=>{

    displayMessage("Valid password", "#00C400");
    displayLine("Valid password.");

    setTimeout(()=>{

        fakeConsoleContainer.style.opacity = 0;
        panelDisplay.style.visibility = "visible";
        panelDisplay.style.opacity = 1;

    }, 700)

})

socket.on("confidential-data", (givenRoomsData, givenTokensLength) => {

    updatePanel(givenRoomsData, givenTokensLength);

})

socket.on('disconnect', ()=>{
    alert("You have been disconnected from the server");
    location.reload();
});


/*

<div class = "roomTab">

    <div class = "roomTabButton active">ASDS</div>
    <div class = "roomTabContents"></div>

</div>

*/

function requestNewData(){

    roomsDisplay.innerHTML = ""
    socket.emit("requesting-admin-data")

}

function updatePanel(givenRoomsData, givenTokensLength){

    usersLength.textContent = `Users in memory: ${givenTokensLength}`;
    roomsLength.textContent = `Active rooms: ${Object.keys(givenRoomsData).length}`

    Object.keys(givenRoomsData).forEach((roomID)=>{

        const roomTab = document.createElement("div");
        const roomTabButton = document.createElement("div");
        const roomTabContents = document.createElement("div");

        roomTab.classList.add("roomTab");
        roomTabButton.classList.add("roomTabButton");
        roomTabButton.classList.add("active");
        roomTabContents.classList.add("roomTabContents");

        Object.keys(givenRoomsData[roomID].users).forEach((userID)=>{

            const userText = document.createElement("p");
            const br = document.createElement("br");

            userText.textContent = `${givenRoomsData[roomID].users[userID].username}: ${givenRoomsData[roomID].users[userID].socketID}`;

            roomTabContents.appendChild(userText);
            roomTabContents.appendChild(br);

        });

        roomTabButton.textContent = roomID;

        roomTab.appendChild(roomTabButton);
        roomTab.appendChild(roomTabContents);

        roomsDisplay.appendChild(roomTab);

    })

}

function addRoomTab(roomID, users){

    const roomIDDisplay = document.createElement("div")

}

function displayLine(message){

    const line = document.createElement("div");
    line.textContent = message;
    fakeConsole.appendChild(line);

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

function inputUser(text){

    isPaused = true;
    const prompt = document.createElement("div");
    prompt.classList.add("consoleDiv");
    const input = document.createElement("input");
    input.classList.add("consoleInputs");
    const br = document.createElement("br")

    prompt.textContent = text;
    input.enterKeyHint = "done";
    input.type = "password"
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

document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  
    if (keyName === 'Enter' && isPaused) {

        const consoleInputs = document.getElementsByClassName("consoleInputs");
        const inputValue = consoleInputs[consoleInputs.length - 1].value;
        const consoleDiv = document.getElementsByClassName("consoleDiv");  
        consoleInputs[consoleInputs.length - 1].remove();

        consoleDiv[consoleDiv.length-1].textContent += "*".repeat(inputValue.length);
        
        displayLine("Validating password...");

        socket.emit("check-admin", inputValue);
        console.log(`input value: ${inputValue}`);

        isPaused = false;

    }
});