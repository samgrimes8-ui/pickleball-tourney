export const initialData = {
  "event": "Pickleball Team Building",
  "date": "4/30/2026",
  "notes": "Final roster. 5 teams. Full round robin, each team plays 4 games, rests 1 slot. Top 2 play Championship.",
  "courts": 2,
  "tournament_format": {
    "type": "Round Robin + Final",
    "team_count": 5,
    "team_size": "2 (one team of 3)",
    "scoring": "Best of 1, game to 11 (win by 2), rally scoring",
    "advancement": "Top 2 from round robin play Championship Final",
    "round_robin": {
      "total_matches": 10,
      "matches": [
        { "match": 1,  "home": "Three's a Crowd", "away": "Pickle Rick",    "court": 1, "slot": 1, "bye": "Ace Ventura",     "home_score": null, "away_score": null },
        { "match": 2,  "home": "The Drop Kings",  "away": "Smash Bros",     "court": 2, "slot": 1,                           "home_score": null, "away_score": null },
        { "match": 3,  "home": "Three's a Crowd", "away": "The Drop Kings", "court": 1, "slot": 2, "bye": "Smash Bros",      "home_score": null, "away_score": null },
        { "match": 4,  "home": "Pickle Rick",     "away": "Ace Ventura",    "court": 2, "slot": 2,                           "home_score": null, "away_score": null },
        { "match": 5,  "home": "Three's a Crowd", "away": "Smash Bros",     "court": 1, "slot": 3, "bye": "Pickle Rick",     "home_score": null, "away_score": null },
        { "match": 6,  "home": "The Drop Kings",  "away": "Ace Ventura",    "court": 2, "slot": 3,                           "home_score": null, "away_score": null },
        { "match": 7,  "home": "Three's a Crowd", "away": "Ace Ventura",    "court": 1, "slot": 4, "bye": "The Drop Kings",  "home_score": null, "away_score": null },
        { "match": 8,  "home": "Pickle Rick",     "away": "Smash Bros",     "court": 2, "slot": 4,                           "home_score": null, "away_score": null },
        { "match": 9,  "home": "Pickle Rick",     "away": "The Drop Kings", "court": 1, "slot": 5, "bye": "Three's a Crowd", "home_score": null, "away_score": null },
        { "match": 10, "home": "Smash Bros",      "away": "Ace Ventura",    "court": 2, "slot": 5,                           "home_score": null, "away_score": null }
      ]
    },
    "finals": [
      { "match": "F1", "label": "Championship", "home": "#1 Seed", "away": "#2 Seed", "court": 1, "slot": 6, "home_score": null, "away_score": null },
      { "match": "F2", "label": "3rd Place",    "home": "#3 Seed", "away": "#4 Seed", "court": 2, "slot": 6, "home_score": null, "away_score": null }
    ]
  },
  "rest_schedule": {
    "slot_1": "Ace Ventura",
    "slot_2": "Smash Bros",
    "slot_3": "Pickle Rick",
    "slot_4": "The Drop Kings",
    "slot_5": "Three's a Crowd"
  },
  "skill_scoring": { "Advanced": 3, "Intermediate": 2, "Beginner": 1 },
  "teams": [
    {
      "team_id": 1,
      "team_name": "Three's a Crowd",
      "player_count": 3,
      "total_skill_score": 5,
      "avg_skill_score": 1.67,
      "notes": "Trio — Lau joined from dissolved Net Gainers. Rotate 1 player out each game.",
      "members": [
        { "name": "Tan",    "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
        { "name": "Safian", "skill_level": "Intermediate", "gender": "M" },
        { "name": "Lau",    "skill_level": "Beginner",     "gender": "M" }
      ]
    },
    {
      "team_id": 2,
      "team_name": "Pickle Rick",
      "player_count": 2,
      "total_skill_score": 3,
      "avg_skill_score": 1.5,
      "members": [
        { "name": "Sam",   "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
        { "name": "Yuhao", "skill_level": "Beginner",     "gender": "M" }
      ]
    },
    {
      "team_id": 3,
      "team_name": "The Drop Kings",
      "player_count": 2,
      "total_skill_score": 3,
      "avg_skill_score": 1.5,
      "members": [
        { "name": "Allen",   "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
        { "name": "Tabitha", "skill_level": "Beginner",     "gender": "F" }
      ]
    },
    {
      "team_id": 4,
      "team_name": "Smash Bros",
      "player_count": 2,
      "total_skill_score": 3,
      "avg_skill_score": 1.5,
      "members": [
        { "name": "Tim",  "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
        { "name": "Ozan", "skill_level": "Beginner",     "gender": "M" }
      ]
    },
    {
      "team_id": 5,
      "team_name": "Ace Ventura",
      "player_count": 2,
      "total_skill_score": 3,
      "avg_skill_score": 1.5,
      "members": [
        { "name": "Rohit",  "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
        { "name": "Steven", "skill_level": "Beginner",     "gender": "M" }
      ]
    }
  ],
  "not_playing": [
    { "name": "Baljit",  "reason": "Dropped out" },
    { "name": "Nathan",  "reason": "Dropped out" },
    { "name": "Ralph",   "reason": "Dropped out" },
    { "name": "Mehmet",  "reason": "Dropped out" },
    { "name": "Gregg",   "reason": "Dropped out" },
    { "name": "Logan",   "reason": "Dropped out" },
    { "name": "Shelia",  "reason": "Dropped out" },
    { "name": "James",   "reason": "Dropped out" },
    { "name": "Assiya",  "reason": "PTD" },
    { "name": "Christina" },
    { "name": "Chris" },
    { "name": "Debra" },
    { "name": "Erin" },
    { "name": "Judy" },
    { "name": "Sean" },
    { "name": "Tom", "reason": "Declined" }
  ]
};
