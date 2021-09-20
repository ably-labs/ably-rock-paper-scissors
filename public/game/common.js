function startGame() {
    let nameField = document.getElementById("name");
    name = nameField.value;
    if (!name) return;

    let nameInputDiv = document.getElementById("nameinput");

    nameInputDiv.style.visibility = "hidden";

    let context = document.getElementById('game').getContext('2d');
    Game.run(context);
}

function clearScoreboard(){
    document.getElementById("scoreboard").innerHTML = "";
}

function updateList(ranks) {
    let ul = document.getElementById("scoreboard"); 
    for (let i=0; i < ranks.length; i++) {
        let li = document.createElement("li");
        let span = document.createElement("span");
        span.appendChild(document.createTextNode(ranks[i].score));
        li.appendChild(document.createTextNode(ranks[i].name));
        li.appendChild(span);
        ul.appendChild(li);
    }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
