from flask import Blueprint, abort, request, jsonify
from services.jwt_token_service import token_required
from services.pokemon_service import delete_pokemon, update_pokemon, is_created_by_user, get_pokemon_by_id, get_all_pokemons, add_pokemon, validate_data, get_pokemon_by_user

pokemon_bp = Blueprint("pokemon_bp", __name__)

# Get all pokemon in the database
@pokemon_bp.route("/pokemon", methods=["GET"])
def manage_pokemon():
    if request.method == "GET":
        pokemons = get_all_pokemons()
        return jsonify([{
                            "id": pokemon[0], 
                            "name": pokemon[1],
                            "creator": pokemon[2],
                            "types": pokemon[3],
                            "image": pokemon[4]
                        } for pokemon in pokemons])
    
# Get pokemon from id
@pokemon_bp.route("/pokemon/<int:pokemon_id>", methods=["GET"])
def manage_by_id_pokemon(pokemon_id):
    if request.method == "GET":
        pokemon = get_pokemon_by_id(pokemon_id)
        return jsonify({ 
                            "id": pokemon[0], 
                            "name": pokemon[1],
                            "creator": pokemon[2],
                            "types": pokemon[3],
                            "image": pokemon[4]
                        })
    
# Update and Delete Pokemon
@pokemon_bp.route("/pokemon/<int:pokemon_id>", methods=["PUT", "DELETE"])
@token_required
def modify_delete_pokemon(user_data, pokemon_id):
    if request.method == "PUT":
        if not is_created_by_user(pokemon_id, user_data.username):
            abort(400, "You cannot edit a pokemon you didn't create")

        data = request.json
        types, name, image = validate_data(data)

        update_pokemon(types, name, image, pokemon_id)

        return jsonify({"message": "pokemon successfully updated!"})
    if request.method == "DELETE":
        delete_pokemon(pokemon_id)
        return jsonify({"message": "pokemon successfully deleted!"})


# Create pokemon, Get current users created pokemon
@pokemon_bp.route("/user/pokemon", methods=["POST", "GET"])
@token_required
def manage_user_pokemon(user_data):
    if request.method == "POST":
        # Check user body
        data = request.json
        types, name, image = validate_data(data)
        
        # Check if types are valid
        add_pokemon(types, name, image, user_data.username)

        return jsonify({"message": "pokemon successfully added!"})
    
    if request.method == "GET":
        pokemons = get_pokemon_by_user(user_data.username)
        return jsonify([{
                            "id": pokemon[0], 
                            "name": pokemon[1],
                            "creator": pokemon[2],
                            "types": pokemon[3],
                            "image": pokemon[4]
                        } for pokemon in pokemons])

# Get pokemon from other users
@pokemon_bp.route("/user/pokemon/<int:user_id>", methods=["GET"])
def manage_other_user_pokemon(user_id):
    if request.method == "GET":
        pokemons = get_pokemon_by_user(user_id)
        return jsonify([{
                            "id": pokemon[0], 
                            "name": pokemon[1],
                            "creator": pokemon[2],
                            "types": pokemon[3],
                            "image": pokemon[4]
                        } for pokemon in pokemons])