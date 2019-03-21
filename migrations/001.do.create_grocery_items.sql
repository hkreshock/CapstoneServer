-- CREATE TABLE grocery_lists (
--     id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
--     title TEXT NOT NULL,
--     content SELECT * FROM grocery_items;
--     date_created TIMESTAMP DEFAULT now() NOT NULL
-- );

CREATE TABLE grocery_items (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    quantity TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);