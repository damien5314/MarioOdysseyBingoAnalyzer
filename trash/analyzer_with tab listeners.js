var currentTab;

/*
 * Switches currentTab and currentBookmark to reflect the currently active tab
 */
function updateActiveTab(tabs) {
  function updateTab(tabs) {
    if (tabs[0]) {
		// console.log(tabs[0]);
		this.currentTab = tabs[0];
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

function parseBoardHtml() {
	// let board_raw = document.getElementsByTagName("body")[0].innerHTML;
	console.log("currentTab");
	console.log(this.currentTab);
	let board_raw = this.currentTab.executeScript("console.log(\"printing console from executeScript\");");
	console.log("board_raw");
	console.log(board_raw);
    let board = [];
    if (board_raw.includes('<tbody>')) {
        let table = board_raw.substring(board_raw.indexOf('<tbody>'), board_raw.indexOf('</tbody>'));
        let cells = table.split('100%;">');
        let row = [];
        cells.forEach(function(cell, index) {
            if (!cell.includes('<tbody>')) {
                row.push(cell.split('</div>')[0]);
                if (index % 5 === 0) {
                    board.push(row);
                    row = [];
                }
            }
        });
    } else {
		console.log("no tbody uh oh");
	}
    return board;
}

function listClass(kingdom) {
    let classStr = "list-group-item list-group-item-";
    if (kingdom.index > 9) {
        classStr += "danger";
    } else if (kingdom.index > 7) {
        classStr += "warning";
    } else {
        classStr += "success";
    }
    return classStr;
}

function analyze(board) {
	let results = [];
    if (board.length === 5) {
        let cellResults = [];
        let resultRow = [];
        let worstKingdom;
        let currKingdom;
        let taskList = this.normal;
        // get earliest kingdom finish for every cell
        board.forEach(function(row) {
            row.forEach(function(task) {
                resultRow.push(taskList[task]);
            });
            cellResults.push(resultRow);
            resultRow = [];
        });
        let hasLake, hasWooded;
        // get latest kingdom finish for every row
        for (i = 0; i < cellResults.length; i++) {
            worstKingdom = this.kingdoms.cap;
            hasLake = false;
            hasWooded = false;
            for (j = 0; j < cellResults[i].length; j++) {
                currKingdom = cellResults[i][j].kingdom;
                if (currKingdom === this.kingdoms.lake) {
                    hasLake = true;
                } else if (currKingdom === this.kingdoms.wooded) {
                    hasWooded = true;
                }
                if (worstKingdom.index < currKingdom.index) {
                    worstKingdom = currKingdom;
                }
            }
            results.push({
                row: "Row " + (i + 1),
                kingdom: worstKingdom.index == 4 && hasLake && hasWooded ? this.kingdoms.L_and_W : worstKingdom,
                difficulty: cellResults[i].reduce((sum, curr) => sum + curr.difficulty, 0)
            });
        }
        // get latest kingdom finish for every column
        let difficulty;
        for (i = 0; i < cellResults.length; i++) {
            worstKingdom = this.kingdoms.cap;
            hasLake = false;
            hasWooded = false;
            difficulty = 0;
            for (j = 0; j < cellResults[i].length; j++) {
                currKingdom = cellResults[j][i].kingdom;
                difficulty += cellResults[j][i].difficulty;
                if (currKingdom === this.kingdoms.lake) {
                    hasLake = true;
                } else if (currKingdom === this.kingdoms.wooded) {
                    hasWooded = true;
                }
                if (worstKingdom.index < currKingdom.index) {
                    worstKingdom = currKingdom;
                }
            }
            results.push({
                row: "Column " + (i + 1),
                kingdom: worstKingdom.index == 4 && hasLake && hasWooded ? this.kingdoms.L_and_W : worstKingdom,
                difficulty: difficulty
            });
        }
        // get latest kingdom finish for top left bottom right
        worstKingdom = this.kingdoms.cap;
        difficulty = 0;
        hasLake = false;
        hasWooded = false;
        for (i = 0; i < cellResults.length; i++) {
            currKingdom = cellResults[i][i].kingdom;
            difficulty += cellResults[i][i].difficulty;
            if (currKingdom === this.kingdoms.lake) {
                hasLake = true;
            } else if (currKingdom === this.kingdoms.wooded) {
                hasWooded = true;
            }
            if (worstKingdom.index < currKingdom.index) {
                worstKingdom = currKingdom;
            }
        }
        results.push({
            row: "TL-BR",
            kingdom: worstKingdom.index == 4 && hasLake && hasWooded ? this.kingdoms.L_and_W : worstKingdom,
            difficulty: difficulty
        });
        // get latest kingdom finish for top left down right
        worstKingdom = this.kingdoms.cap;
        difficulty = 0;
        hasLake = false;
        hasWooded = false;
        for (i = 0; i < cellResults.length; i++) {
            currKingdom = cellResults[4 - i][i].kingdom;
            difficulty += cellResults[4 - i][i].difficulty;
            if (currKingdom === this.kingdoms.lake) {
                hasLake = true;
            } else if (currKingdom === this.kingdoms.wooded) {
                hasWooded = true;
            }
            if (worstKingdom.index < currKingdom.index) {
                worstKingdom = currKingdom;
            }
        }
        results.push({
            row: "BL-TR",
            kingdom: worstKingdom.index == 4 && hasLake && hasWooded ? this.kingdoms.L_and_W : worstKingdom,
            difficulty: difficulty
        });
    } else {
		console.log("unexpected boardHtml");
		console.log(board);
	}
	return results;
}

let kingdoms = {
    cap: {
        name: "Cap",
        index: 1
    },
    cascade: {
        name: "Cascade",
        index: 2
    },
    sand: {
        name: "Sand",
        index: 3
    },
    L_or_W: {
        name: "Lake or Wooded",
        index: 3.5
    },
    lake: {
        name: "Lake First",
        index: 4
    },
    wooded: {
        name: "Wooded First",
        index: 4
    },
    L_and_W: {
        name: "Wooded Second",
        index: 5
    },
    cloud: {
        name: "Cloud",
        index: 6
    },
    lost: {
        name: "Lost",
        index: 7
    },
    metroN: {
        name: "Metro (Night)",
        index: 8
    },
    metroD: {
        name: "Metro (Day)",
        index: 9
    },
    snow: {
        name: "Snow",
        index: 10
    },
    seaside: {
        name: "Seaside",
        index: 10
    },
    snowside: {
        name: "Snow + Seaside",
        index: 11
    },
    luncheon: {
        name: "Luncheon",
        index: 12
    },
    ruined: {
        name: "Ruined",
        index: 13
    },
    bowsers: {
        name: "Bowsers",
        index: 14
    },
    moon: {
        name: "Moon",
        index: 15
    }
};

let analyzerData = {
    headline: 'SMO Bingo Analyzer',
    description: 'Analyze SMO Bingo boards by pasting the HTML body below.',
    category: 'normal',
    board_raw: '',
    results: [],
    kingdoms: kingdoms,
    short: {

    },
    normal: {
        "Captain Toad (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 1
        },
        "Purchase 4 Hats": {
            kingdom: kingdoms.sand,
            difficulty: 1
        },
        "Atop the Highest Tower (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 1
        },
        "Call Jaxi from 2 Stands": {
            kingdom: kingdoms.sand,
            difficulty: 1
        },
        "3 Checkpoints (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 1
        },
        "20 Regional Coins (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 1
        },
        "2 Moons from sub-areas (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 1
        },
        "1 Moon from Keys": {
            kingdom: kingdoms.sand,
            difficulty: 1
        },
        "Ice Cave Treasure-Moon (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 1
        },
        "7 Moons from Nuts": {
            kingdom: kingdoms.wooded,
            difficulty: 2
        },
        "3 Checkpoints (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 2
        },
        "Captain Toad (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 2
        },
        "4 Checkpoints (Metro)": {
            kingdom: kingdoms.metroN,
            difficulty: 2
        },
        "Captain Toad (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 2
        },
        "6 Checkpoints (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 2
        },
        "25 Regional Coins (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 2
        },
        "10 Moons from sub-areas (Total)": {
            kingdom: kingdoms.sand,
            difficulty: 2
        },
        "Captain Toad (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 2
        },
        "Plant 1 Seed (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 2
        },
        "2 Moons from Slots": {
            kingdom: kingdoms.metroD,
            difficulty: 3
        },
        "Look at 2 Hint Arts": {
            kingdom: kingdoms.L_and_W,
            difficulty: 3
        },
        "2 Moons from sub-areas (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 3
        },
        "7 Checkpoints (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 3
        },
        "1 Moon from Lakitu-Fishing": {
            kingdom: kingdoms.sand,
            difficulty: 3
        },
        "2 Stickers": {
            kingdom: kingdoms.sand,
            difficulty: 3
        },
        "1 Warp-Painting Moon": {
            kingdom: kingdoms.sand,
            difficulty: 3
        },
        "Answer 6 Sphynx Questions Correctly": {
            kingdom: kingdoms.wooded,
            difficulty: 3
        },
        "Purchase 4 Souvenirs": {
            kingdom: kingdoms.L_or_W,
            difficulty: 3
        },
        "30 Regional Coins (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 3
        },
        "Puzzle Room Solved! (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 3
        },
        "20 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "4 Checkpoints (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 4
        },
        "3 Timer Challenges": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "Purchase 5 Hats": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "2 Checkpoints (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "Call Jaxi from 3 Stands": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "24 Moons (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 4
        },
        "12 Moons (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 4
        },
        "10 Moons (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 4
        },
        "Purchase 3 Full Costume Sets": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "30 Regional Coins (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 4
        },
        "3 Captain Toad Moons": {
            kingdom: kingdoms.sand,
            difficulty: 5
        },
        "3 Moons from 8-bit Sections": {
            kingdom: kingdoms.sand,
            difficulty: 5
        },
        "20 Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 5
        },
        "Captain Toad (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 5
        },
        "3 Moons from Moon Shards": {
            kingdom: kingdoms.sand,
            difficulty: 5
        },
        "Moon Shards in the Sand (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 5
        },
        "12 Moons (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 5
        },
        "4 Moons (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 5
        },
        "4 Moons from Music Notes": {
            kingdom: kingdoms.lake,
            difficulty: 5
        },
        "2 Moons from Shiny Rocks": {
            kingdom: kingdoms.wooded,
            difficulty: 5
        },
        "35 Regional Coins (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 5
        },
        "10 Regional Coins (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 6
        },
        "20 Regional Coins (Metro)": {
            kingdom: kingdoms.metroN,
            difficulty: 6
        },
        "25 Regional Coins (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 1
        },
        "10 Regional Coins (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 6
        },
        "10 Regional Coins (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 6
        },
        "Koopa Trace-Walking (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 6
        },
        "2 Moons (Deep Woods)": {
            kingdom: kingdoms.wooded,
            difficulty: 6
        },
        "35 Regional Coins (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 6
        },
        "Jump-Rope Hero! (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 6
        },
        "4 Unique Life-Up Hearts (excl. Shops)": {
            kingdom: kingdoms.sand,
            difficulty: 6
        },
        "Purchase 4 Moons": {
            kingdom: kingdoms.L_or_W,
            difficulty: 7
        },
        "5 Treasure Chest Moons": {
            kingdom: kingdoms.sand,
            difficulty: 7
        },
        "22 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 7
        },
        "14 Moons (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 7
        },
        "4 Moons from sub-areas (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 7
        },
        "2 Moons from sub-areas (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 7
        },
        "2 Moons from Wooden Crates": {
            kingdom: kingdoms.lake,
            difficulty: 7
        },
        "12 Moons from sub-areas (Total)": {
            kingdom: kingdoms.sand,
            difficulty: 7
        },
        "Purchase 4 Full Costume Sets": {
            kingdom: kingdoms.sand,
            difficulty: 7
        },
        "15 Regional Coins (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 7
        },
        "Outfit-Door (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 8
        },
        "15 Regional Coins (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 8
        },
        "2 Moons from sub-areas (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 8
        },
        "12 Moons (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 8
        },
        "4 Moons from Moon Shards": {
            kingdom: kingdoms.L_or_W,
            difficulty: 8
        },
        "4 Timer Challenges": {
            kingdom: kingdoms.sand,
            difficulty: 8
        },
        "3 Stickers": {
            kingdom: kingdoms.sand,
            difficulty: 8
        },
        "1 Moon from Hint Art": {
            kingdom: kingdoms.L_or_W,
            difficulty: 8
        },
        "26 Moons (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 8
        },
        "4 Moons from sub-areas (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 8
        },
        "20 Regional Coins (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 8
        },
        "25 Regional Coins (Metro)": {
            kingdom: kingdoms.metroN,
            difficulty: 8
        },
        "5 Story Moons (excl. Multi Moons)": {
            kingdom: kingdoms.wooded,
            difficulty: 8
        },
        "8 Moons from Nuts": {
            kingdom: kingdoms.wooded,
            difficulty: 9
        },
        "14 Moons (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 9
        },
        "15 Regional Coins (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 9
        },
        "22 Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 9
        },
        "25 Regional Coins (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 9
        },
        "20 Regional Coins (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 9
        },
        "Capture both the Cactus and the Tree": {
            kingdom: kingdoms.wooded,
            difficulty: 9
        },
        "3 Moons (Deep Woods)": {
            kingdom: kingdoms.wooded,
            difficulty: 9
        },
        "20 Unique Captures": {
            kingdom: kingdoms.L_or_W,
            difficulty: 9
        },
        "40 Regional Coins (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 9
        },
        "Plant 4 Seeds (Total)": {
            kingdom: kingdoms.lake,
            difficulty: 10
        },
        "5 Moons from 8-bit Sections": {
            kingdom: kingdoms.L_or_W,
            difficulty: 10
        },
        "4 Stickers": {
            kingdom: kingdoms.L_or_W,
            difficulty: 10
        },
        "5 Timer Challenges": {
            kingdom: kingdoms.sand,
            difficulty: 10
        },
        "30 Regional Coins (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 10
        },
        "Showdown on the Inverted Pyramid (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 10
        },
        "Purchase 5 Full Costume Sets": {
            kingdom: kingdoms.sand,
            difficulty: 10
        },
        "30 Regional Coins (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 10
        },
        "30 Regional Coins (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 10
        },
        "RC Car: Race Complete! (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 10
        },
        "6 Unique Life-Up Hearts (excl. Shops)": {
            kingdom: kingdoms.L_or_W,
            difficulty: 10
        },
        "Outfit-Door (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 11
        },
        "4 Moons from sub-areas (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 11
        },
        "6 Moons (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 11
        },
        "4 Captain Toad Moons": {
            kingdom: kingdoms.L_or_W,
            difficulty: 11
        },
        "Call Jaxi from 4 Stands": {
            kingdom: kingdoms.sand,
            difficulty: 11
        },
        "Outfit-Door (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 11
        },
        "20 Regional Coins (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 11
        },
        "Wear the Boxer Shorts": {
            kingdom: kingdoms.sand,
            difficulty: 11
        },
        "9 Moons from Nuts": {
            kingdom: kingdoms.wooded,
            difficulty: 11
        },
        "22 Unique Captures": {
            kingdom: kingdoms.wooded,
            difficulty: 11
        },
        "45 Regional Coins (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 11
        },
        "Herding Sheep in the Dunes (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 11
        },
        "24 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 12
        },
        "6 Moons from sub-areas (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 12
        },
        "Purchase 6 Souvenirs": {
            kingdom: kingdoms.lost,
            difficulty: 12
        },
        "25 Regional Coins (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 12
        },
        "90 Moons (Total)": {
            kingdom: kingdoms.L_or_W,
            difficulty: 12
        },
        "Look at 3 Hint Arts": {
            kingdom: kingdoms.metroD,
            difficulty: 12
        },
        "3 Moons from Wooden Crates": {
            kingdom: kingdoms.metroD,
            difficulty: 12
        },
        "14 Moons from sub-areas (Total)": {
            kingdom: kingdoms.sand,
            difficulty: 12
        },
        "4 Moons (Deep Woods)": {
            kingdom: kingdoms.wooded,
            difficulty: 12
        },
        "2 Moons from Hint Art": {
            kingdom: kingdoms.L_and_W,
            difficulty: 12
        },
        "35 Regional Coins (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 12
        },
        "35 Regional Coins (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 12
        },
        "35 Regional Coins (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 12
        },
        "4 Moons from sub-areas (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 13
        },
        "24 Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 13
        },
        "Plant 5 Seeds (Total)": {
            kingdom: kingdoms.metroD,
            difficulty: 13
        },
        "100 Total Regional Coins": {
            kingdom: kingdoms.sand,
            difficulty: 13
        },
        "1 Moon from Goombas": {
            kingdom: kingdoms.sand,
            difficulty: 13
        },
        "5 Multi Moons": {
            kingdom: kingdoms.wooded,
            difficulty: 13
        },
        "5 Checkpoints (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 13
        },
        "24 Unique Captures": {
            kingdom: kingdoms.L_and_W,
            difficulty: 13
        },
        "Purchase 6 Full Costume Sets": {
            kingdom: kingdoms.L_or_W,
            difficulty: 13
        },
        "14 Moons (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 13
        },
        "25 Regional Coins (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 13
        },
        "7 Story Moons (excl. Multi Moons)": {
            kingdom: kingdoms.metroD,
            difficulty: 13
        },
        "6 Moons from sub-areas (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 14
        },
        "Purchase 5 Moons": {
            kingdom: kingdoms.L_and_W,
            difficulty: 14
        },
        "2 Warp-Painting Moons": {
            kingdom: kingdoms.L_or_W,
            difficulty: 14
        },
        "125 Total Regional Coins": {
            kingdom: kingdoms.sand,
            difficulty: 14
        },
        "6 Moons from sub-areas (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 14
        },
        "3 Moons from Shiny Rocks": {
            kingdom: kingdoms.wooded,
            difficulty: 14
        },
        "4 Moons from sub-areas (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 14
        },
        "40 Regional Coins (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 14
        },
        "50 Regional Coins (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 14
        },
        "40 Regional Coins (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 14
        },
        "16 Moons (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 15
        },
        "6 Checkpoints (Metro)": {
            kingdom: kingdoms.metroN, // with warp painting
            difficulty: 15
        },
        "5 Moons from Music Notes": {
            kingdom: kingdoms.metroD,
            difficulty: 15
        },
        "5 Moons from Moon Shards": {
            kingdom: kingdoms.L_and_W,
            difficulty: 15
        },
        "26 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 15
        },
        "10 Moons from Nuts": {
            kingdom: kingdoms.wooded,
            difficulty: 15
        },
        "16 Moons from sub-areas (Total)": {
            kingdom: kingdoms.sand,
            difficulty: 15
        },
        "2 Ground-Pound Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 15
        },
        "3 Ground-Pound Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 15
        },
        "26 Unique Captures": {
            kingdom: kingdoms.L_and_W,
            difficulty: 15
        },
        "8 Unique Life-Up Hearts (excl. Shops)": {
            kingdom: kingdoms.L_and_W,
            difficulty: 15
        },
        "150 Total Regional Coins": {
            kingdom: kingdoms.sand,
            difficulty: 16
        },
        "6 Timer Challenges": {
            kingdom: kingdoms.sand,
            difficulty: 16
        },
        "7 Treasure Chest Moons": {
            kingdom: kingdoms.L_or_W,
            difficulty: 16
        },
        "3 Checkpoints (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 16
        },
        "95 Moons (Total)": {
            kingdom: kingdoms.L_or_W,
            difficulty: 16
        },
        "Purchase 7 Full Costume Sets": {
            kingdom: kingdoms.L_or_W,
            difficulty: 16
        },
        "45 Regional Coins (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 16
        },
        "World Peace in 3 Kingdoms (excl. Cap, Cloud, Lost)": {
            kingdom: kingdoms.L_or_W,
            difficulty: 16
        },
        "30 Regional Coins (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 16
        },
        "10 Regional Coins (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 16
        },
        "Captain Toad (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 16
        },
        "All Regional Coins in 1 Kingdom": {
            kingdom: kingdoms.cascade,
            difficulty: 16
        },
        "8 Moons (Cap)": {
            kingdom: kingdoms.sand,
            difficulty: 17
        },
        "Purchase 6 Moons": {
            kingdom: kingdoms.lost,
            difficulty: 17
        },
        "16 Moons (Cascade)": {
            kingdom: kingdoms.cascade,
            difficulty: 17
        },
        "8 Checkpoints (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 17
        },
        "Uncork 1 Fountain (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 17
        },
        "Captain Toad (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 17
        },
        "50 Regional Coins (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 17
        },
        "28 Unique Captures": {
            kingdom: kingdoms.lost,
            difficulty: 17
        },
        "2 Moons from Keys": {
            kingdom: kingdoms.lake,
            difficulty: 17
        },
        "1 Moon from Seeds": {
            kingdom: kingdoms.sand,
            difficulty: 17
        },
        "16 Moons (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 18
        },
        "8 Moons from sub-areas (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 18
        },
        "175 Total Regional Coins": {
            kingdom: kingdoms.sand,
            difficulty: 18
        },
        "4 Checkpoints (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 18
        },
        "Uncork 2 Fountains (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 18
        },
        "4 Moons (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 18
        },
        "15 Regional Coins (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 18
        },
        "World Peace Restored! (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 18
        },
        "Outfit-Door (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 18
        },
        "3 Warp-Painting Moons": {
            kingdom: kingdoms.L_and_W,
            difficulty: 19
        },
        "28 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 19
        },
        "5 Captain Toad Moons": {
            kingdom: kingdoms.L_and_W,
            difficulty: 19
        },
        "7 Timer Challenges": {
            kingdom: kingdoms.L_or_W,
            difficulty: 19
        },
        "Uncork 3 Fountains (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 19
        },
        "25 Regional Coins (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 19
        },
        "Purchase 8 Full Costume Sets": {
            kingdom: kingdoms.wooded,
            difficulty: 19
        },
        "6 Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 19
        },
        "All Regional Coins in 2 Kingdoms": {
            kingdom: kingdoms.sand,
            difficulty: 19
        },
        "200 Total Regional Coins": {
            kingdom: kingdoms.sand,
            difficulty: 20
        },
        "2 Moons from Goombas": {
            kingdom: kingdoms.wooded,
            difficulty: 20
        },
        "6 Multi Moons": {
            kingdom: kingdoms.L_and_W,
            difficulty: 20
        },
        "30 Regional Coins (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 20
        },
        "20 Regional Coins (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 20
        },
        "18 Moons from sub-areas (Total)": {
            kingdom: kingdoms.sand,
            difficulty: 20
        },
        "8 Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 20
        },
        "6 Moons (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 20
        },
        "World Peace Restored! (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 20
        },
        "5 Stickers": {
            kingdom: kingdoms.L_and_W,
            difficulty: 21
        },
        "9 Treasure Chest Moons": {
            kingdom: kingdoms.L_and_W,
            difficulty: 21
        },
        "35 Regional Coins (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 21
        },
        "10 Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 21
        },
        "8 Moons (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 21
        },
        "1 Barrier-Moon (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 21
        },
        "Look at 4 Hint Arts": {
            kingdom: kingdoms.seaside,
            difficulty: 21
        },
        "60 Regional Coins (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 21
        },
        "Outfit-Door (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 21
        },
        "1 Checkpoint (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 21
        },
        "6 Moons from Moon Shards": {
            kingdom: kingdoms.lost,
            difficulty: 22
        },
        "26 Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 22
        },
        "2 Moons from sub-areas (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 22
        },
        "40 Regional Coins (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 22
        },
        "100 Moons (Total)": {
            kingdom: kingdoms.L_or_W,
            difficulty: 22
        },
        "3 Ground-Pound Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 22
        },
        "18 Moons (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 22
        },
        "Answer 8 Sphynx Questions Correctly": {
            kingdom: kingdoms.seaside,
            difficulty: 22
        },
        "9 Story Moons (excl. Multi Moons)": {
            kingdom: kingdoms.metroD,
            difficulty: 22
        },
        "25 Regional Coins (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 23
        },
        "Goomba Picture-Match (Cloud)": {
            kingdom: kingdoms.metroN,
            difficulty: 23
        },
        "4 Ground-Pound Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 23
        },
        "18 Moons (Lost)": {
            kingdom: kingdoms.lost,
            difficulty: 23
        },
        "2 Barrier-Moons (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 23
        },
        "Catch the Rabbit! (Lost)": {
            kingdom: kingdoms.metroN,
            difficulty: 23
        },
        "30 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 23
        },
        "6 Moons from Music Notes": {
            kingdom: kingdoms.seaside,
            difficulty: 24
        },
        "7 Moons from 8-bit Sections": {
            kingdom: kingdoms.lost,
            difficulty: 24
        },
        "225 Total Regional Coins": {
            kingdom: kingdoms.L_or_W,
            difficulty: 24
        },
        "20 Moons from sub-areas (Total)": {
            kingdom: kingdoms.sand,
            difficulty: 24
        },
        "5 Ground-Pound Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 24
        },
        "4 Moons from sub-areas (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 24
        },
        "World Peace Restored! (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 25
        },
        "20 Moons (Lake)": {
            kingdom: kingdoms.lake,
            difficulty: 25
        },
        "3 Barrier-Moons (Snow)": {
            kingdom: kingdoms.snow,
            difficulty: 25
        },
        "10 Moons from sub-areas (Metro)": {
            kingdom: kingdoms.metroD,
            difficulty: 25
        },
        "28 Moons (Wooded)": {
            kingdom: kingdoms.wooded,
            difficulty: 25
        },
        "32 Moons (Sand)": {
            kingdom: kingdoms.sand,
            difficulty: 25
        },
        "6 Ground-Pound Moons (Seaside)": {
            kingdom: kingdoms.seaside,
            difficulty: 25
        }
    }
}

function handleClick() {
	console.log("Analyzing Bingo board");
	// TODO: Find body of the HTML page
	let boardHtml = parseBoardHtml();
	console.log("parseBoardHtml complete");
	console.log(boardHtml);
	// TODO: Pass body element into the proper function (what is that?)
	let results = analyze(boardHtml);
	console.log("results");
	console.log(results);
	// TODO: Display results in board-container div
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

browser.browserAction.onClicked.addListener(handleClick);
console.log("analyzer extension loaded");