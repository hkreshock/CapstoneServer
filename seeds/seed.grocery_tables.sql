BEGIN;

TRUNCATE
  grocery_items,
  grocery_users
  RESTART IDENTITY CASCADE;

-- $2a$12$.GA.05GnIPcPZf8WpCZbouNzinClxRljDeUEjwTUIxcEIphLAV4xq
-- dunder password

INSERT INTO grocery_users (id, user_name, full_name, email, password)
VALUES
  (1, 'dunder', 'Dunder Mifflin', 'Dunder@Mifflin.com','password'),
  (2, 'b.deboop', 'Bodeep Deboop', 'Bodeep@Deboop.com', '$2a$12$e7Sc4gIcabuQ.cl0jJQjteLGusf4sY4Euszh8VmLFuQFi6yOXGvNy'),
  (3, 'c.bloggs', 'Charlie Bloggs', 'Charlie@Bloggs.com', '$2a$12$jGKOlUVQhe/r21tg.axq8us20ynbVNe4jYchurohoG2HPrRowK1GC'),
  (4, 's.smith', 'Sam Smith', 'Sam@Smith.com', '$2a$12$yfA8Q5HmJWGE8F.ORvF..uib/DwgXABwg0uB20f9X2evQj9YZP.6O'),
  (5, 'lexlor', 'Alex Taylor', 'Alex@Taylor.com', '$2a$12$0uBMgmMc9KuxaQWTcPSIzuP5/7VkFbLoJ6G5FOtcty8BhhJ49aG6.'),
  (6, 'wippy', 'Ping Won In', 'Ping@WonIn.com', '$2a$12$ntGOlTLG5nEXYgDVqk4bPejBoJP65HfH2JEMc1JBpXaVjXo5RsTUu');

INSERT INTO grocery_items (id, title, quantity)
VALUES
  (1, 'Apples', 2),
  (2, 'Bananas', 8),
  (3, 'Pie', 1),
  (4, 'Milk', 2),
  (5, 'Paper Towels', 6),
  (6, 'Cheese Pack', 1),
  (7, 'Bread Loaf', 2),
  (8, 'Hot Dog Packs', 2),
  (9, 'Pack of Buns', 3),
  (10, 'Mustard', 1);

COMMIT;
