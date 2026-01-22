from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)

# Load menu data
def load_menu_data():
    with open('menu_items.json', 'r') as f:
        return json.load(f)

# API endpoint to get menu items
@app.route('/api/menu')
def get_menu():
    category = request.args.get('category', 'all')
    menu_data = load_menu_data()
    
    if category == 'all':
        return jsonify(menu_data)
    else:
        filtered_items = [item for item in menu_data if item['category'] == category]
        return jsonify(filtered_items)

# API endpoint to place order
@app.route('/api/order', methods=['POST'])
def place_order():
    order_data = request.json
    # In a real app, you would save this to a database
    print(f"Order received: {order_data}")
    return jsonify({
        "success": True,
        "order_id": "ORD" + str(hash(str(order_data)))[:8].upper(),
        "message": "Thank you for your order! It will be ready in 15-20 minutes."
    })

# Main route
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)