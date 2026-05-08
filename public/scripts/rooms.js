
const loadingElement = document.getElementById("frontPageLoader");
const fakeConsoleContainer = document.getElementById("fakeConsoleContainer");
const fakeConsole = document.getElementById("fakeConsole");
const usernameInput = document.getElementById("usernameInput");

const createRoomBlurr = document.getElementById("createRoomBlurr");

let isPaused = false;

socket.on('disconnect', ()=>{
    alert("You have been disconnected from the server");
    location.reload();
});


socket.on("invalid-token", ()=>{

    alert("invalid token")
    window.location = "index.html";

})

socket.on("existing-token", ()=>{

    setTimeout(()=>{

        loadingElement.style.display = "none";

        fakeConsoleContainer.style.visibility = "visible";
        fakeConsoleContainer.style.opacity = 1;

        const line = document.createElement("div");
        line.textContent = `Welcome, ${localUsername}.`;
        fakeConsole.appendChild(line);

        setTimeout(()=>{

            inputUser("Enter a room code: ");

        }, 1500)

    }, 2500)

})

socket.on("invalid-room", (givenMsg)=>{

    const br = document.createElement("br");
    fakeConsole.appendChild(br)

    const line = document.createElement("div");
    line.textContent = givenMsg;
    fakeConsole.appendChild(line);

    inputUser("Enter a room code: ");

})

socket.on("valid-room", (givenRoomCode)=>{

    window.location = `code.html#${givenRoomCode}`

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

function createRoomPrompt(){

    isPaused = false;
    createRoomBlurr.style.display = "block";
    
    
    setTimeout(()=>socket.emit("create-room"), 1200)

}

function logOutPrompt(){

    socket.emit("log-user-out");
    localStorage.clear();

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