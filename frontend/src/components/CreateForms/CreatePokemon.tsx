import { useContext, useEffect, useState } from "react";
import { ExtensivePokemonData, Type } from "../../interfaces/PokemonInterfaces";
import { UserContext } from "../../context/UserAuth";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTypes } from "../../utilities/fetchTypes";
import { capitalizeFirstCharacter } from "../../utilities/helpers";
import {
  createPokemon,
  fetchPokemonById,
  updatePokemon,
} from "../../utilities/fetchPokemonInfo";

interface Props {
  updateMode: boolean;
}

/*
  Create / Update Pokemon Component.
  Component mode (update/create) changed depending on the page URL 

  Create Component:
  Form to create Pokemon. Using the PokeBuilder API. 

  Update Component:
  Form to update Pokemon. Fills inputs with prexisiting data. Allows users to change the data of a prexisting Pokemon.

*/
function CreatePokemon(props: Props) {
  // Parameters needed for form functionality
  const { id } = useParams();
  const { axiosFetch, username } = useContext(UserContext);
  const [types, setTypes] = useState<Type[]>([]);
  const [pokemonData, setPokemonData] = useState<ExtensivePokemonData>({
    base_stats: {
      hp: 0,
      attack: 0,
      defense: 0,
      sp_attack: 0,
      sp_defense: 0,
      speed: 0,
    },
    creator: "",
    pokemon_id: 0,
    pokemon_image: "",
    pokemon_name: "",
    pokemon_types: ["normal", ""],
    pokemon_moves: [],
  });

  // Checks if prerequisite API calls have been made
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // On load gets all types. Update mode, gets previous pokemon data.
  useEffect(() => {
    async function getAllTypes() {
      const response = await fetchTypes(axiosFetch);
      setTypes(response);
    }
    async function getPokemonData() {
      const response = await fetchPokemonById(axiosFetch, id as string);
      if (username != response.creator) {
        navigate("/");
      }
      setPokemonData({
        ...response,
        pokemon_types: [
          response.pokemon_types[0].name,
          response.pokemon_types && response.pokemon_types[1]
            ? response.pokemon_types[1].name
            : "",
        ],
      });
    }
    getAllTypes();
    if (props.updateMode) {
      getPokemonData();
    }
    setIsLoading(true);
  }, []);

  // Submit pokemon data to update / create
  const submitPokemon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!props.updateMode) {
      const response = await createPokemon(axiosFetch, pokemonData);
      navigate("/pokemon/create/" + response.data.id);
    } else {
      await updatePokemon(axiosFetch, pokemonData, id as string);
      navigate(("/pokemon/" + id) as string);
    }
  };

  // Loads form only if the prerequisite API calls were made.
  return isLoading ? (
    <>
      <div
        className="container-fluid bg-white bg-gradient"
        id={"buildPokemonPage"}
      >
        <div className="row justify-content-center mt-1 py-5">
          <div className="col-lg-6 bg-light shadow-sm card px-5 py-3">
            <div className="text-center fw-bold fs-1 mt-3">
              {props.updateMode
                ? "Update Your Pokemon!"
                : "Create Your Pokemon!"}
            </div>
            <form>
              <div className="form-group my-3">
                <div className="fw-bold mb-2 fs-5">General Info</div>
                <label>Name</label>
                <input
                  type="text"
                  maxLength={12}
                  minLength={3}
                  className="form-control"
                  value={pokemonData.pokemon_name}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      pokemon_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="row justify-content-center">
                <div className="col text-center">
                  <img
                    src={pokemonData.pokemon_image}
                    alt={"No Image Found"}
                    id={"pokemonImage"}
                  />
                </div>
              </div>

              <div className="form-group my-3">
                <label>Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={pokemonData.pokemon_image}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      pokemon_image: e.target.value,
                    })
                  }
                />
              </div>

              <div className="fw-bold mb-2 fs-5">Type</div>
              <div className="row">
                <div className="col">
                  <div className="form-group my-3">
                    <label>Type 1</label>
                    <select
                      className="form-control"
                      value={pokemonData.pokemon_types[0] as string}
                      onChange={(e) => {
                        setPokemonData({
                          ...pokemonData,
                          pokemon_types: [
                            e.target.value,
                            pokemonData.pokemon_types[1] as string,
                          ],
                        });
                      }}
                    >
                      {types.map((type, index) => {
                        return (
                          <option value={`${type.name}`} key={index}>
                            {capitalizeFirstCharacter(type.name)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="col">
                  <div className="form-group my-3">
                    <label>Type 2</label>
                    <select
                      className="form-control"
                      value={pokemonData.pokemon_types[1] as string}
                      onChange={(e) => {
                        setPokemonData({
                          ...pokemonData,
                          pokemon_types: [
                            pokemonData.pokemon_types[0] as string,
                            e.target.value,
                          ],
                        });
                      }}
                    >
                      <option value={``}>No Second Type</option>
                      {types.map((type, index) => {
                        return (
                          <option value={`${type.name}`} key={index}>
                            {capitalizeFirstCharacter(type.name)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="fw-bold fs-5">Base Stats</div>
              <div className="form-group my-3">
                <label>HP</label>
                <input
                  type="number"
                  className="form-control"
                  value={pokemonData.base_stats.hp}
                  max={255}
                  min={10}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      base_stats: {
                        ...pokemonData.base_stats,
                        hp: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="form-group my-3">
                <label>Attack</label>
                <input
                  type="number"
                  className="form-control"
                  max={255}
                  min={10}
                  value={pokemonData.base_stats.attack}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      base_stats: {
                        ...pokemonData.base_stats,
                        attack: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="form-group my-3">
                <label>Defense</label>
                <input
                  type="number"
                  className="form-control"
                  value={pokemonData.base_stats.defense}
                  max={255}
                  min={10}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      base_stats: {
                        ...pokemonData.base_stats,
                        defense: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="form-group my-3">
                <label>Special Attack</label>
                <input
                  type="number"
                  className="form-control"
                  value={pokemonData.base_stats.sp_attack}
                  max={255}
                  min={10}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      base_stats: {
                        ...pokemonData.base_stats,
                        sp_attack: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="form-group my-3">
                <label>Special Defense</label>
                <input
                  type="number"
                  className="form-control"
                  value={pokemonData.base_stats.sp_defense}
                  max={255}
                  min={10}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      base_stats: {
                        ...pokemonData.base_stats,
                        sp_defense: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Speed</label>
                <input
                  type="number"
                  className="form-control"
                  value={pokemonData.base_stats.speed}
                  max={255}
                  min={10}
                  onChange={(e) =>
                    setPokemonData({
                      ...pokemonData,
                      base_stats: {
                        ...pokemonData.base_stats,
                        speed: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <input
                  className="form-control btn btn-primary"
                  type="submit"
                  onClick={submitPokemon}
                  value={props.updateMode ? "Update" : "Create"}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div>loading</div>
  );
}

export default CreatePokemon;
