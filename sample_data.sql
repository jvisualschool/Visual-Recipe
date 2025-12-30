USE bitnami_app;

INSERT INTO recipes (title, ingredients_json, steps_json, image_url, view_type, style_type, likes) VALUES
('Classic Gimbap (Korean)', '["Rice", "Seaweed", "Carrot", "Spinach", "Egg"]', '["Cook Rice", "Prepare Veggies", "Roll tight"]', 'https://placehold.co/600x800/orange/white?text=Gimbap', 'vertical', 'infographic', 142),
('Kimchi Fried Rice (Spicy)', '["Kimchi", "Rice", "Spam", "Egg"]', '["Fry Kimchi", "Add Rice", "Top with Egg"]', 'https://placehold.co/400x300/red/white?text=Kimchi+Rice', 'horizontal', 'watercolor', 320),
('Avocado Toast (Brunch)', '["Bread", "Avocado", "Salt", "Pepper"]', '["Toast Bread", "Mash Avocado", "Season"]', 'https://placehold.co/400x400/green/white?text=Avo+Toast', 'square', 'minimal', 88),
('Budget Ramen Hack (Student)', '["Ramen", "Egg", "Green Onion"]', '["Boil Water", "Add Ramen", "Add Egg"]', 'https://placehold.co/400x400/blue/white?text=Ramen', 'square', 'minimal', 500),
('Bulgogi Pizza (Fusion)', '["Pizza Dough", "Bulgogi", "Cheese"]', '["Spread Dough", "Add Toppings", "Bake"]', 'https://placehold.co/600x600/brown/white?text=Bulgogi+Pizza', 'square', 'infographic', 210),
('Mango Bingsu (Dessert)', '["Ice", "Mango", "Milk", "Syrup"]', '["Shave Ice", "Add Mango", "Drizzle Syrup"]', 'https://placehold.co/600x800/yellow/white?text=Mango+Bingsu', 'vertical', 'watercolor', 1050);
