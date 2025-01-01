-- -----------------------------------------------------
-- Schema cocktail_canvas
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `cocktail_canvas`;
USE `cocktail_canvas` ;

-- -----------------------------------------------------
-- Table `cocktail_canvas`.`drinks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`drinks` (
  `drink_id` INT NOT NULL AUTO_INCREMENT,
  `drink_name` VARCHAR(64) NOT NULL,
  `drink_method` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`drink_id`));


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`glass`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`glass` (
  `glass_id` INT NOT NULL AUTO_INCREMENT,
  `glass_name` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`glass_id`));


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`drinkglass`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`drinkglass` (
  `drink_id` INT NOT NULL,
  `glass_id` INT NOT NULL,
  INDEX `glass_id_idx` (`glass_id` ASC) VISIBLE,
  INDEX `drink_id_idx` (`drink_id` ASC) VISIBLE,
  CONSTRAINT `drink_id`
    FOREIGN KEY (`drink_id`)
    REFERENCES `cocktail_canvas`.`drinks` (`drink_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `glass_id`
    FOREIGN KEY (`glass_id`)
    REFERENCES `cocktail_canvas`.`glass` (`glass_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`ingredients` (
  `ingr_id` INT NOT NULL AUTO_INCREMENT,
  `ingr_name` VARCHAR(64) NOT NULL,
  `abv` VARCHAR(45) NULL DEFAULT NULL,
  `desc` VARCHAR(128) NULL DEFAULT NULL,
  PRIMARY KEY (`ingr_id`));


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`drinkingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`drinkingredients` (
  `drink_id` INT NOT NULL,
  `ingr_id` INT NOT NULL,
  `measure` VARCHAR(32) NULL DEFAULT NULL,
  INDEX `drinkid_idx` (`drink_id` ASC) VISIBLE,
  INDEX `ingr_id_drink_idx` (`ingr_id` ASC) VISIBLE,
  CONSTRAINT `drink_id_ingr`
    FOREIGN KEY (`drink_id`)
    REFERENCES `cocktail_canvas`.`drinks` (`drink_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `ingr_id_drink`
    FOREIGN KEY (`ingr_id`)
    REFERENCES `cocktail_canvas`.`ingredients` (`ingr_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(16) NOT NULL,
  `firstName` VARCHAR(20) NULL DEFAULT NULL,
  `lastName` VARCHAR(30) NULL DEFAULT NULL,
  `company` VARCHAR(64) NULL DEFAULT NULL,
  `email` VARCHAR(320) NULL DEFAULT NULL,
  `hashedPassword` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`user_id`));


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`menus`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`menus` (
  `menu_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `menu_name` VARCHAR(50) NOT NULL,
  `menu_desc` VARCHAR(256) NULL DEFAULT NULL,
  PRIMARY KEY (`menu_id`),
  INDEX `menu_user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `menu_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `cocktail_canvas`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `cocktail_canvas`.`menudrinks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`menudrinks` (
  `menu_id` INT NOT NULL,
  `drink_id` INT NOT NULL,
  `price` DECIMAL(5,2) NULL DEFAULT NULL,
  INDEX `menu_id_idx` (`menu_id` ASC) VISIBLE,
  INDEX `menu_drink_id_idx` (`drink_id` ASC) VISIBLE,
  CONSTRAINT `drink_menu_id`
    FOREIGN KEY (`menu_id`)
    REFERENCES `cocktail_canvas`.`menus` (`menu_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `menu_drink_id`
    FOREIGN KEY (`drink_id`)
    REFERENCES `cocktail_canvas`.`drinks` (`drink_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

USE `cocktail_canvas` ;

-- -----------------------------------------------------
-- Placeholder table for view `cocktail_canvas`.`wholecocktails`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`wholecocktails` (`drink_id` INT, `drink_name` INT, `drink_method` INT, `glass_name` INT, `ingr_name` INT, `measure` INT);

-- -----------------------------------------------------
-- Placeholder table for view `cocktail_canvas`.`wholecocktails_permenu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cocktail_canvas`.`wholecocktails_permenu` (`menu_id` INT, `drink_id` INT, `drink_name` INT, `drink_method` INT, `glass_name` INT, `price` INT, `ingr_name` INT, `measure` INT);

-- -----------------------------------------------------
-- procedure add_drink_to_db
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_drink_to_db`(
    IN in_drink_name VARCHAR(50), 
    IN in_drink_method VARCHAR(512), 
    IN in_glass_name VARCHAR(32), 
    IN in_price DECIMAL(5,2), 
    IN in_ingr_measures TEXT, 
    IN in_menu_id INT
)
BEGIN
    DECLARE glass_insert_id INT;
    DECLARE drink_insert_id INT;
    DECLARE ingr_insert_id INT;
    DECLARE ingredient_name VARCHAR(255);
    DECLARE measurement VARCHAR(255);
    DECLARE ingredient_count INT;
    DECLARE i INT DEFAULT 0;

    -- Exit handler to capture errors
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
    -- Add to drinks table
    INSERT INTO drinks (drink_name, drink_method) VALUES (in_drink_name, in_drink_method);
    SET drink_insert_id = LAST_INSERT_ID();

    -- Check or insert glass
    IF NOT EXISTS (SELECT 1 FROM glass WHERE LOWER(glass_name) = LOWER(in_glass_name)) THEN
        INSERT INTO glass (glass_name) VALUES (in_glass_name);
        SET glass_insert_id = LAST_INSERT_ID();
    ELSE
        SET glass_insert_id = (SELECT glass_id FROM glass WHERE LOWER(glass_name) = LOWER(in_glass_name));
    END IF;

    -- Link drink and glass
    INSERT INTO drinkglass (drink_id, glass_id) VALUES (drink_insert_id, glass_insert_id);

    -- Handle ingredients
    SET ingredient_count = JSON_LENGTH(JSON_EXTRACT(in_ingr_measures, '$.ingredients'));
    WHILE i < ingredient_count DO
        SET ingredient_name = JSON_UNQUOTE(JSON_EXTRACT(in_ingr_measures, CONCAT('$.ingredients[', i, ']')));
        SET measurement = JSON_UNQUOTE(JSON_EXTRACT(in_ingr_measures, CONCAT('$.measurements[', i, ']')));
        
        IF NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(ingr_name) = LOWER(ingredient_name)) THEN
            INSERT INTO ingredients (ingr_name) VALUES (ingredient_name);
            SET ingr_insert_id = LAST_INSERT_ID();
        ELSE
            SET ingr_insert_id = (SELECT ingr_id FROM ingredients WHERE LOWER(ingr_name) = LOWER(ingredient_name));
		END IF;

        INSERT INTO drinkingredients (drink_id, ingr_id, measure) VALUES (drink_insert_id, ingr_insert_id, measurement);
        SET i = i + 1;
    END WHILE;

    -- Link to menu
    INSERT INTO menudrinks (menu_id, drink_id, price) VALUES (in_menu_id, drink_insert_id, in_price);
    
    COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure add_existing_drink_to_menu
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_existing_drink_to_menu`(IN in_drink_id INT, IN in_menu_id INT)
BEGIN
	INSERT INTO menudrinks (drink_id, menu_id) VALUES (in_drink_id, in_menu_id);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure check_menu_against_user
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `check_menu_against_user`(
    IN input_menu_id INT,
    IN input_user_id INT
)
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN TRUE 
            ELSE FALSE 
        END AS is_owner
    FROM menus
    WHERE menu_id = input_menu_id AND user_id = input_user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure create_menu_proc
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_menu_proc`(IN menu_name varchar(50), IN menu_desc varchar(256), IN user_id INT)
BEGIN
INSERT INTO menus (menu_name, menu_desc, user_id) VALUES (menu_name, menu_desc, user_id);
SELECT last_insert_id() as menu_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure create_user
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_user`(IN in_username VARCHAR(16), IN in_first VARCHAR(20), IN in_last VARCHAR(30), IN in_email VARCHAR(320), IN in_company VARCHAR(64), IN in_pass VARCHAR(64))
BEGIN
	INSERT INTO users (username, firstName, lastName, email, company, hashedPassword) VALUES (in_username,in_first,in_last,in_email,in_company,in_pass);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_all_drinks
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_drinks`()
BEGIN
	SELECT drink_id, drink_name, drink_method, glass_name, price, ingr_name, measure
    FROM wholecocktails_permenu
    ORDER BY drink_name ASC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_all_glasses
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_glasses`()
BEGIN
	SELECT glass_name FROM glass;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_all_ingrs
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_ingrs`()
BEGIN
	SELECT ingr_name FROM ingredients;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_all_menus
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_menus`()
BEGIN
	SELECT menu_id, menu_name, menu_desc FROM menus;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_all_users
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_users`()
BEGIN
	SELECT username, firstName, lastName, company FROM users;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_current_drink_list
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_current_drink_list`(IN in_menu_id INT)
BEGIN
	SELECT drink_id, drink_name, drink_method, glass_name, price, ingr_name, measure
    FROM wholecocktails_permenu
    WHERE wholecocktails_permenu.menu_id = in_menu_id
    ORDER BY drink_name ASC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_drink
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_drink`(IN drinkId INT)
BEGIN
	SELECT drink_id, drink_name, drink_method, glass_name, price, ingr_name, measure
    FROM wholecocktails_permenu
    WHERE drink_id = drinkId;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_drink_by_name
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_drink_by_name`(IN drink_name VARCHAR(50))
BEGIN
	SELECT drink_id FROM drinks WHERE drink_name = drinks.drink_name;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_drink_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_drink_count`()
BEGIN
	SELECT COUNT(drink_name) as drink_count from drinks;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_glass
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_glass`(IN glass_id INT)
BEGIN
	SELECT glass_name FROM glass WHERE glass_id = glass.glass_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_ingr
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_ingr`(IN ingr_id INT)
BEGIN
	SELECT ingr_name FROM ingredients WHERE ingr_id = ingredients.ingr_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_ingr_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_ingr_count`()
BEGIN
	SELECT COUNT(ingr_name) as ingr_count from ingredients;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_menu
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_menu`(IN menuId INT)
BEGIN
	SELECT menu_id, menu_name, menu_desc
    FROM menus
    WHERE menuId = menu_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_menu_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_menu_count`()
BEGIN
	SELECT COUNT(menu_name) as menu_count from menus;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_menu_list_for_user
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_menu_list_for_user`(IN in_user_id INT)
BEGIN
	SELECT * FROM menus WHERE menus.user_id = in_user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_user
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user`(IN userId INT)
BEGIN
	SELECT user_id, username, company, firstName, lastName
    FROM users
    WHERE userId = user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_user_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_count`()
BEGIN
	SELECT COUNT(username) as user_count from users;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_user_login_details
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_login_details`(IN in_user_name varchar(16))
BEGIN
	SELECT user_id, hashedPassword FROM users WHERE username = in_user_name;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure list_drink_by_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `list_drink_by_count`()
BEGIN
	SELECT drink_name, COUNT(drink_name) as `No. of menus featured in` FROM drinks LEFT JOIN menudrinks ON (menudrinks.drink_id = drinks.drink_id)
    GROUP BY drink_name
    ORDER BY `No. of menus featured in` DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure list_drinks_by_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `list_drinks_by_count`()
BEGIN
	SELECT drink_name, COUNT(drink_name) as `No. of menus featured in` FROM drinks LEFT JOIN menudrinks ON (menudrinks.drink_id = drinks.drink_id)
    GROUP BY drink_name
    ORDER BY `No. of menus featured in` DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure list_glass_by_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `list_glass_by_count`()
BEGIN
	SELECT glass_name, COUNT(glass_name) as `No. of drinks featured in` 
    FROM glass LEFT JOIN drinkglass ON (glass.glass_id = drinkglass.glass_id)
    GROUP BY glass_name
    ORDER BY `No. of drinks featured in` DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure list_ingr_by_count
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `list_ingr_by_count`()
BEGIN
	SELECT ingr_name, COUNT(ingr_name) as `No. of drinks featured in` 
    FROM ingredients LEFT JOIN drinkingredients ON (ingredients.ingr_id = drinkingredients.ingr_id)
    GROUP BY ingr_name
    ORDER BY `No. of drinks featured in` DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure remove_drink_from_menu
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `remove_drink_from_menu`(IN drink_id INT, in menu_id INT)
BEGIN
	DELETE FROM menudrinks WHERE drink_id = menudrinks.drink_id AND menu_id = menudrinks.menu_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure search_for_drink
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `search_for_drink`(IN drinkquery varchar(64))
BEGIN
	SELECT drink_id, drink_name, drink_method, glass_name, ingr_name, measure
    FROM wholecocktails
    WHERE drink_name LIKE CONCAT('%', drinkquery, '%');
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure search_for_glass
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `search_for_glass`(IN glassquery varchar(32))
BEGIN
	SELECT glass_id, glass_name
    FROM glass
    WHERE glass_name LIKE CONCAT('%', glassquery, '%');
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure search_for_ingr
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `search_for_ingr`(IN ingrquery varchar(64))
BEGIN
	SELECT ingr_id, ingr_name
    FROM ingredients
    WHERE ingr_name LIKE CONCAT('%', ingrquery, '%');
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure search_for_menu
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `search_for_menu`(IN menuquery varchar(50))
BEGIN
	SELECT menu_id, menu_name, menu_desc, users.username as creator_name
    FROM menus LEFT JOIN users ON (menus.user_id = users.user_id)
    WHERE menu_name LIKE CONCAT('%', menuquery, '%');
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure search_for_user
-- -----------------------------------------------------

DELIMITER $$
USE `cocktail_canvas`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `search_for_user`(IN userquery varchar(16))
BEGIN
	SELECT username, company, firstName, lastName
    FROM users
    WHERE username LIKE CONCAT('%', userquery, '%') OR
          company LIKE CONCAT('%', userquery, '%') OR
          firstName LIKE CONCAT('%', userquery, '%') OR
          lastName LIKE CONCAT('%', userquery, '%');
END$$
DELIMITER ;

-- -----------------------------------------------------
-- View `cocktail_canvas`.`wholecocktails`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cocktail_canvas`.`wholecocktails`;
USE `cocktail_canvas`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `cocktail_canvas`.`wholecocktails` AS select `cocktail_canvas`.`drinks`.`drink_id` AS `drink_id`,`cocktail_canvas`.`drinks`.`drink_name` AS `drink_name`,`cocktail_canvas`.`drinks`.`drink_method` AS `drink_method`,`cocktail_canvas`.`glass`.`glass_name` AS `glass_name`,`cocktail_canvas`.`ingredients`.`ingr_name` AS `ingr_name`,`cocktail_canvas`.`drinkingredients`.`measure` AS `measure` from ((((`cocktail_canvas`.`drinks` left join `cocktail_canvas`.`drinkglass` on((`cocktail_canvas`.`drinks`.`drink_id` = `cocktail_canvas`.`drinkglass`.`drink_id`))) left join `cocktail_canvas`.`glass` on((`cocktail_canvas`.`drinkglass`.`glass_id` = `cocktail_canvas`.`glass`.`glass_id`))) left join `cocktail_canvas`.`drinkingredients` on((`cocktail_canvas`.`drinks`.`drink_id` = `cocktail_canvas`.`drinkingredients`.`drink_id`))) left join `cocktail_canvas`.`ingredients` on((`cocktail_canvas`.`drinkingredients`.`ingr_id` = `cocktail_canvas`.`ingredients`.`ingr_id`)));

-- -----------------------------------------------------
-- View `cocktail_canvas`.`wholecocktails_permenu`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cocktail_canvas`.`wholecocktails_permenu`;
USE `cocktail_canvas`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `cocktail_canvas`.`wholecocktails_permenu` AS select `cocktail_canvas`.`menudrinks`.`menu_id` AS `menu_id`,`cocktail_canvas`.`drinks`.`drink_id` AS `drink_id`,`cocktail_canvas`.`drinks`.`drink_name` AS `drink_name`,`cocktail_canvas`.`drinks`.`drink_method` AS `drink_method`,`cocktail_canvas`.`glass`.`glass_name` AS `glass_name`,`cocktail_canvas`.`menudrinks`.`price` AS `price`,`cocktail_canvas`.`ingredients`.`ingr_name` AS `ingr_name`,`cocktail_canvas`.`drinkingredients`.`measure` AS `measure` from (((((`cocktail_canvas`.`menudrinks` left join `cocktail_canvas`.`drinks` on((`cocktail_canvas`.`menudrinks`.`drink_id` = `cocktail_canvas`.`drinks`.`drink_id`))) left join `cocktail_canvas`.`drinkglass` on((`cocktail_canvas`.`drinks`.`drink_id` = `cocktail_canvas`.`drinkglass`.`drink_id`))) left join `cocktail_canvas`.`glass` on((`cocktail_canvas`.`drinkglass`.`glass_id` = `cocktail_canvas`.`glass`.`glass_id`))) left join `cocktail_canvas`.`drinkingredients` on((`cocktail_canvas`.`drinks`.`drink_id` = `cocktail_canvas`.`drinkingredients`.`drink_id`))) left join `cocktail_canvas`.`ingredients` on((`cocktail_canvas`.`drinkingredients`.`ingr_id` = `cocktail_canvas`.`ingredients`.`ingr_id`)));

# Create the app user
CREATE USER IF NOT EXISTS 'cocktail_canvas_app'@'localhost' IDENTIFIED BY 'password'; 
GRANT ALL PRIVILEGES ON cocktail_canvas.* TO 'cocktail_canvas_app'@'localhost';