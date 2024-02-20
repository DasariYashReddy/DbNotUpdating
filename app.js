const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

async function dbInitialise() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started on http://localhost:3000");
    });
  } catch (e) {
    console.log(` DB Error is ${e.message}`);
    process.exit(1);
  }
}
dbInitialise();

///test
app.get("/", (request, response) => {
  response.send("Server is Running");
});

///Get Players API
app.get("/players/", async (request, response) => {
  const PlayersQuery = `
  SELECT
   * 
   FROM
    cricket_team;`;

  const PlayersArray = await db.all(PlayersQuery);
  const ans = (PlayersArray) => {
    return {
      playerId: PlayersArray.player_id,
      playerName: PlayersArray.player_name,
      jerseyNumber: PlayersArray.jersey_number,
      role: PlayersArray.role,
    };
  };
  response.send(PlayersArray.map((eachplayer) => ans(eachplayer)));
});

///Create new Player API
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const playerAddQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES
    ('${playerName}',${jerseyNumber},'${role}');`;
  console.log(playerAddQuery);
  const insertResponse = await db.run(playerAddQuery);
  response.send("Player Added to Team");
});

///Get player by ID API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const PlayerByIdQuery = `
    SELECT 
    * 
     FROM 
     cricket_team 
        WHERE 
        player_id=${playerId};`;
  const PlayerOfId = await db.get(PlayerByIdQuery);
  const ans = (PlayerOfId) => {
    return {
      playerId: PlayerOfId.player_id,
      playerName: PlayerOfId.player_name,
      jerseyNumber: PlayerOfId.jersey_number,
      role: PlayerOfId.role,
    };
  };
  response.send(ans(PlayerOfId));
});

/// Update Player API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, rolE } = request.body;
  const update_player_query = `
    UPDATE 
    cricket_team
    SET
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${rolE}'
    WHERE 
    player_id=${playerId};`;
  await db.run(update_player_query);
  response.send("Player Details Updated");
});

///Delete Player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const DeleteQuery = `
    DELETE FROM
     cricket_team 
     WHERE
     player_id=${playerId}`;
  await db.run(DeleteQuery);
  response.send("Player Removed");
});

module.exports = app;
