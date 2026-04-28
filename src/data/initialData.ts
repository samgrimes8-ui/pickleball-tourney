export const initialData = {
  "event": "Pickleball Team Building",
  "date": "4/30/2026",
  "notes": "Sam is setting up brackets.",
  "courts": 2,
  "tournament_format": {
    "type": "Group Stage + Knockout",
    "team_count": 9,
    "team_size": "2 (one team of 3)",
    "scoring": "Best of 1, game to 11 (win by 2), rally scoring",
    "advancement": "Top 1 from each group + best 2nd place = 4 teams in knockouts",
    "groups": [
      {
        "group_id": "A",
        "group_color": "Red",
        "teams": ["Dink or Swim", "Lob Stars", "Pickle Rick"],
        "total_skill_score": 10,
        "matches": [
          { "match": 1, "home": "Dink or Swim", "away": "Lob Stars", "court": 1, "slot": 1, "home_score": null, "away_score": null },
          { "match": 2, "home": "Lob Stars", "away": "Pickle Rick", "court": 1, "slot": 2, "home_score": null, "away_score": null },
          { "match": 3, "home": "Dink or Swim", "away": "Pickle Rick", "court": 1, "slot": 3, "home_score": null, "away_score": null }
        ]
      },
      {
        "group_id": "B",
        "group_color": "Blue",
        "teams": ["Three's a Crowd", "The Drop Kings", "Ace Ventura"],
        "total_skill_score": 11,
        "matches": [
          { "match": 4, "home": "Three's a Crowd", "away": "The Drop Kings", "court": 2, "slot": 1, "home_score": null, "away_score": null },
          { "match": 5, "home": "The Drop Kings", "away": "Ace Ventura", "court": 2, "slot": 2, "home_score": null, "away_score": null },
          { "match": 6, "home": "Three's a Crowd", "away": "Ace Ventura", "court": 2, "slot": 3, "home_score": null, "away_score": null }
        ]
      },
      {
        "group_id": "C",
        "group_color": "Green",
        "teams": ["Net Gainers", "Smash Bros", "Kitchen Crew"],
        "total_skill_score": 9,
        "matches": [
          { "match": 7, "home": "Net Gainers", "away": "Smash Bros", "court": 1, "slot": 4, "home_score": null, "away_score": null },
          { "match": 8, "home": "Kitchen Crew", "away": "Net Gainers", "court": 2, "slot": 4, "home_score": null, "away_score": null },
          { "match": 9, "home": "Smash Bros", "away": "Kitchen Crew", "court": 1, "slot": 5, "home_score": null, "away_score": null }
        ]
      }
    ],
    "knockout": {
      "semi_finals": [
        { "match": "SF1", "home": "Group A Winner", "away": "Group C Winner", "court": 1, "home_score": null, "away_score": null },
        { "match": "SF2", "home": "Group B Winner", "away": "Wildcard (best 2nd place)", "court": 2, "home_score": null, "away_score": null }
      ],
      "finals": [
        { "match": "F1", "label": "Championship", "home": "SF1 Winner", "away": "SF2 Winner", "court": 1, "home_score": null, "away_score": null },
        { "match": "F2", "label": "3rd Place", "home": "SF1 Loser", "away": "SF2 Loser", "court": 2, "home_score": null, "away_score": null }
      ]
    }
  },
  "skill_scoring": { "Advanced": 3, "Intermediate": 2, "Beginner": 1 },
  "teams": [
    { "team_id": 1, "team_name": "Dink or Swim", "group": "A", "members": [
      { "name": "Safian", "skill_level": "Advanced", "gender": "M", "role": "Captain" },
      { "name": "Shelia", "skill_level": "Beginner", "gender": "F" }
    ]},
    { "team_id": 2, "team_name": "The Drop Kings", "group": "B", "members": [
      { "name": "Allen", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Tabitha", "skill_level": "Beginner", "gender": "F" }
    ]},
    { "team_id": 3, "team_name": "Net Gainers", "group": "C", "members": [
      { "name": "Gregg", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Lau", "skill_level": "Beginner", "gender": "M" }
    ]},
    { "team_id": 4, "team_name": "Smash Bros", "group": "C", "members": [
      { "name": "James", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Ozan", "skill_level": "Beginner", "gender": "M" }
    ]},
    { "team_id": 5, "team_name": "Lob Stars", "group": "A", "members": [
      { "name": "Logan", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Nathan", "skill_level": "Beginner", "gender": "M" }
    ]},
    { "team_id": 6, "team_name": "Kitchen Crew", "group": "C", "members": [
      { "name": "Ralph", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Mehmet", "skill_level": "Beginner", "gender": "M" }
    ]},
    { "team_id": 7, "team_name": "Ace Ventura", "group": "B", "members": [
      { "name": "Rohit", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Steven", "skill_level": "Beginner", "gender": "M" }
    ]},
    { "team_id": 8, "team_name": "Pickle Rick", "group": "A", "members": [
      { "name": "Sam", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Yuhao", "skill_level": "Beginner", "gender": "M" }
    ]},
    { "team_id": 9, "team_name": "Three's a Crowd", "group": "B", "members": [
      { "name": "Tan", "skill_level": "Intermediate", "gender": "M", "role": "Captain" },
      { "name": "Tim", "skill_level": "Intermediate", "gender": "M" },
      { "name": "Baljit", "skill_level": "Beginner", "gender": "M" }
    ]}
  ],
  "not_playing": [
    { "name": "Assiya", "reason": "PTD" },
    { "name": "Christina" },
    { "name": "Chris" },
    { "name": "Debra" },
    { "name": "Erin" },
    { "name": "Judy" },
    { "name": "Sean" },
    { "name": "Tom", "reason": "Declined" }
  ]
};
