import React, { useCallback, useReducer, useEffect, useState } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (ingredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...ingredients, action.ingredient];
    case "DELETE":
      return ingredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("should not reached here");
  }
};

/*
const httpStates = (httpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loadingState: true, err: null };
    case "RES":
      return { ...httpState, loadingState: false };
    case "ERR":
      return { loadingState: false, err: action.error };
    default:
      throw new Error("Should not reach here");
  }
};
*/

function Ingredients() {
  //  const [ingredients, setIngredients] = useState([]);
  /* const [userHttpStates, setuserHttpStates] = useReducer(httpStates, {
    loadingState: true,
    err: null,
  });*/

  const [userIngredients, setIngredients] = useReducer(ingredientReducer, []);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("https://react-hooks-5f9c3.firebaseio.com/ingredients.json")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const loadedIngredients = [];
        for (const key in data) {
          loadedIngredients.push({
            id: key,
            title: data[key].title,
            amount: data[key].amount,
          });
        }
        setIngredients({ type: "SET", ingredients: loadedIngredients });
      })
      .catch((err) => {
        setErr("Something Went Wrong");
        setLoading(false);
      });
  }, []);

  const onSearchIngredient = useCallback((ingredients) => {
    setIngredients({ type: "SET", ingredients: ingredients });
  }, []);

  const removeIngredient = (ingredientID) => {
    setLoading(true);
    fetch(
      `https://react-hooks-5f9c3.firebaseio.com/ingredients/${ingredientID}.json`,
      {
        method: "DELETE",
      }
    )
      .then((data) => {
        setLoading(false);
        setIngredients({ type: "DELETE", id: ingredientID });
      })
      .catch((err) => {
        setErr("Something Went Wrong");
        setLoading(false);
      });
  };

  const addIngredientHandler = (ingredient) => {
    setLoading(true);
    fetch("https://react-hooks-5f9c3.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        setLoading(false);
        return res.json();
      })
      .then((data) => {
        setIngredients({ type: "ADD", ingredient: ingredient });
      })
      .catch((err) => {
        setErr("Something Went Wrong");
        setLoading(false);
      });
  };
  const handleErr = () => {
    setErr(false);
  };

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />
      {err && <ErrorModal onClose={handleErr}>{err}</ErrorModal>}
      <section>
        <Search onFilterData={onSearchIngredient} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredient}
          loading={loading}
        />
      </section>
    </div>
  );
}
export default Ingredients;
