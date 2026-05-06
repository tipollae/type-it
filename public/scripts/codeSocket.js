
const leftSide = document.getElementById("leftSide");

socket.on("existing-token", ()=>{

    const roomCode = String(window.location.href.split("#")[1])
    socket.emit("validate-room-entrance", roomCode)
    
})

socket.on("invalid-token", ()=>{

    alert("invalid token")
    window.location = "index.html";

})

socket.on("invalid-room-entrance", (givenMsg)=>{

    alert(givenMsg);
    window.location = "rooms.html"

})

/*
<div class = "otherTabsContainer">

    <div class = "otherTabButtonsContainer">

        <div class = "otherTabButton active">Username1</div>
        <div class = "otherTabButton" style = "margin-left: 20px">Copy 🗋</div>

    </div>

    <div class = "otherTab"></div>
    
</div>
*/

socket.on("other-user-joined", (givenUsername, givenSocketID)=>{

    addOtherUserTab(givenUsername, givenSocketID);

})

socket.on("get-room-users", (usersList)=>{

    for (let i = 0; i < usersList.length; i++){
        addOtherUserTab(usersList[i].username, usersList[i].socketID);
    }

})

socket.on("user-left-room", (givenSocketID)=>{

    const element = document.getElementById(givenSocketID);
    element.remove();

})

function addOtherUserTab(givenUsername, givenSocketID){

    const otherUserTabContainer = document.createElement("div");
    const otherUserTabButtonsContainer = document.createElement("div");
    const usernameTab = document.createElement("div");
    const copyTab = document.createElement("div");
    const otherTab = document.createElement("div");

    otherUserTabContainer.id = givenSocketID;
    usernameTab.textContent = givenUsername;
    copyTab.textContent = "Copy 🗋";
    copyTab.style.marginLeft = "20px";

    otherUserTabContainer.classList.add("otherTabsContainer");
    otherUserTabButtonsContainer.classList.add("otherTabButtonsContainer");
    usernameTab.classList.add("otherTabButton");
    usernameTab.classList.add("active");
    copyTab.classList.add("otherTabButton");
    otherTab.classList.add("otherTab");

    otherUserTabButtonsContainer.appendChild(usernameTab);
    otherUserTabButtonsContainer.appendChild(copyTab);
    otherUserTabContainer.appendChild(otherUserTabButtonsContainer);
    otherUserTabContainer.appendChild(otherTab);
    leftSide.appendChild(otherUserTabContainer);

}