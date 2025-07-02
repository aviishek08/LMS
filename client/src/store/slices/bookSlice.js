import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleAddBookPopup } from "./popUpSlice";
import { toast } from "react-toastify";

const bookSlice = createSlice({
  name: "book",
  initialState: {
    loading: false,
    error: null,
    message: null,
    books: [],
  },
  reducers: {
    fetchBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchBooksSuccess(state, action) {
      state.loading = false;
      state.books = action.payload;
    },
    fetchBooksFailed(state, action) {
      state.loading = false;
      state.books = action.payload;
      state.message = null;
    },
    addBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addBookSuccess(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    resetBookSlice(state) {
      state.error = null;
      state.message = null;
      state.loading = false;
    },
    deleteBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    deleteBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    deleteBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const fetchAllBooks = () => async (dispatch) => {
  dispatch(bookSlice.actions.fetchBooksRequest());
  await axios
    .get("http://localhost:4000/api/v1/book/all", { withCredentials: true })
    .then((res) => {
      dispatch(bookSlice.actions.fetchBooksSuccess(res.data.books));
    })
    .catch((err) => {
      dispatch(bookSlice.actions.fetchBooksFailed(err.response.data.message));
    });
};

export const addBook = (data) => async (dispatch) => {
  dispatch(bookSlice.actions.addBookRequest());
  await axios
    .post("http://localhost:4000/api/v1/book/admin/add", data, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      bookSlice.actions.addBookSuccess(res.data.message);
      toast.success(res.data.message);
      dispatch(toggleAddBookPopup());
      dispatch(fetchAllBooks());
    })
    .catch((err) => {
      dispatch(bookSlice.actions.addBookFailed(err.response.data.message));
    });
};

export const deleteBook = (id) => async (dispatch) => {
  dispatch(bookSlice.actions.deleteBookRequest());
  try {
    const { data } = await axios.delete(`http://localhost:4000/api/v1/book/delete/${id}`, {
      withCredentials: true,
    });
    dispatch(bookSlice.actions.deleteBookSuccess(data.message));
    toast.success(data.message);
    dispatch(fetchAllBooks());
  } catch (err) {
    dispatch(bookSlice.actions.deleteBookFailed(err.response.data.message));
    toast.error(err.response.data.message);
  }
};


export const updateBookDetails = (id, updatedData) => async (dispatch) => {
  dispatch(bookSlice.actions.addBookRequest());
  try {
    const { data } = await axios.put(
      `http://localhost:4000/api/v1/book/update/${id}`,
      updatedData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch(bookSlice.actions.addBookSuccess(data.message));
    toast.success(data.message);
    dispatch(fetchAllBooks());
  } catch (err) {
    dispatch(bookSlice.actions.addBookFailed(err.response.data.message));
  }
};

export const resetBookSlice = () => bookSlice.actions.resetBookSlice();

export default bookSlice.reducer;
