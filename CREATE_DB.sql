# Create database script for Bettys books

# Create the database
CREATE DATABASE IF NOT EXISTS cocktail_canvas;
USE cocktail_canvas;

# Create the tables
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `firstName` varchar(20) DEFAULT NULL,
  `lastName` varchar(30) DEFAULT NULL,
  `company` varchar(64) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `hashedPassword` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
);

CREATE TABLE `menus` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`menu_id`)
);
  
CREATE TABLE `drinks` (
  `drink_id` int NOT NULL AUTO_INCREMENT,
  `drink_name` varchar(64) NOT NULL,
  `desc` varchar(256) NOT NULL,
  `method` varchar(512) NOT NULL,
  PRIMARY KEY (`drink_id`)
);

CREATE TABLE `menudrinks` (
  `menu_id` int NOT NULL,
  `drink_id` int NOT NULL,
  `price` decimal(5,2) DEFAULT NULL,
  KEY `menu_id_idx` (`menu_id`),
  KEY `drink_id_menu_idx` (`drink_id`),
  CONSTRAINT `drink_id_menu` FOREIGN KEY (`drink_id`) REFERENCES `drinks` (`drink_id`),
  CONSTRAINT `menu_id` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`menu_id`)
);

CREATE TABLE `glass` (
  `glass_id` int NOT NULL,
  `glass_name` varchar(32) NOT NULL,
  PRIMARY KEY (`glass_id`)
);

CREATE TABLE `drinkglass` (
  `drink_id` int NOT NULL,
  `glass_id` int NOT NULL,
  KEY `drinkid_idx` (`drink_id`),
  KEY `glassid_idx` (`glass_id`),
  CONSTRAINT `drinkid` FOREIGN KEY (`drink_id`) REFERENCES `drinks` (`drink_id`),
  CONSTRAINT `glassid` FOREIGN KEY (`glass_id`) REFERENCES `glass` (`glass_id`)
);

CREATE TABLE `ingredients` (
  `ingr_id` int NOT NULL,
  `ingr_name` varchar(64) NOT NULL,
  `abv` varchar(45) DEFAULT NULL,
  `desc` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`ingr_id`)
);

CREATE TABLE `drinkingredients` (
  `drink_id` int NOT NULL,
  `ingr_id` int NOT NULL,
  `measure_ml` decimal(5,1) DEFAULT NULL,
  `measure_gram` decimal(5,1) DEFAULT NULL,
  `measure_other` varchar(64) DEFAULT NULL,
  KEY `drinkid_idx` (`drink_id`),
  KEY `ingr_id_idx` (`ingr_id`),
  CONSTRAINT `drink_id_ingr` FOREIGN KEY (`drink_id`) REFERENCES `drinks` (`drink_id`),
  CONSTRAINT `ingr_id_drink` FOREIGN KEY (`ingr_id`) REFERENCES `ingredients` (`ingr_id`)
);

# Create the app user
CREATE USER IF NOT EXISTS 'cocktail_canvas_app'@'localhost' IDENTIFIED BY 'password'; 
GRANT ALL PRIVILEGES ON cocktail_canvas.* TO 'cocktail_canvas_app'@'localhost';
