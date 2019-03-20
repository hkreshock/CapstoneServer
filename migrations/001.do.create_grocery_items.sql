CREATE TABLE grocery_items (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    quantity TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);