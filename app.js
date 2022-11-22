const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "./cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
  app.listen(3000, () => {
    console.log("Server successfully started");
  });
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => ({
  playerId: dbObject.player_id,
  playerName: dbObject.player_name,
  jerseyNumber: dbObject.jersey_number,
  role: dbObject.role,
});

//Get all the players list API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team 
    `;
  const playersListDbList = await db.all(getPlayersQuery);
  const playerList = playersListDbList.map((each) =>
    convertDbObjectToResponseObject(each)
  );
  response.send(playerList);
});

//Add a new player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetailsQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role) VALUES
      (
        '${playerName}',
         ${jerseyNumber},
        '${role}'
      )`;
  const dbResponse = await db.run(addPlayerDetailsQuery);
  const playerID = dbResponse.lastID;
  response.send(`Player Added to Team`);
});

//Get a player details API

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT * from cricket_team  WHERE player_id = ${playerId}
    `;
  const playerDetails = await db.get(getPlayerDetails);
  const formattedPlayerDetails = convertDbObjectToResponseObject(playerDetails);
  response.send(formattedPlayerDetails);
});

//Update the details of a player API

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetailsQuery = `UPDATE cricket_team SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' WHERE player_id = ${playerId}`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//Delete a player details API

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
