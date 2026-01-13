-- Initialize Database for M-League Fantasy
-- 1. USERS: Stores manager credentials
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    manager_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLUBS: Real-world Malaysian Super League clubs (e.g., JDT, Selangor)
CREATE TABLE clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_code VARCHAR(3) NOT NULL, -- e.g., JDT, KDA, SEL
    logo_url VARCHAR(255)
);

-- 3. PLAYERS: Real-world footballers
CREATE TABLE players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT,
    name VARCHAR(100) NOT NULL,
    position ENUM('GK', 'DEF', 'MID', 'FWD') NOT NULL,
    price DECIMAL(4, 1) NOT NULL, -- e.g., 12.5 (Million)
    total_points INT DEFAULT 0,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

-- 4. FANTASY_TEAMS: The user's specific squad
CREATE TABLE fantasy_teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE, -- One team per user
    team_name VARCHAR(50) NOT NULL,
    budget_remaining DECIMAL(5, 1) DEFAULT 100.0, -- Standard 100M budget
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. TEAM_SELECTION: The link between a User's Team and Players
CREATE TABLE team_selection (
    selection_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    player_id INT,
    is_captain BOOLEAN DEFAULT FALSE,
    is_vice_captain BOOLEAN DEFAULT FALSE,
    is_bench BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (team_id) REFERENCES fantasy_teams(team_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);
