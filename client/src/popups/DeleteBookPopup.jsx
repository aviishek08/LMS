import React from "react";
import { useDispatch } from "react-redux";
import { toggleDeleteBookPopup } from "../store/slices/popUpSlice";
import { deleteBook } from "../store/slices/bookSlice";

const DeleteBookPopup = ({ bookId }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteBook(bookId));
    dispatch(toggleDeleteBookPopup());
  };

  const handleCancel = () => {
    dispatch(toggleDeleteBookPopup());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-[90%] sm:w-[400px] text-center">
        <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
        <p className="mb-6">Are you sure you want to delete this book?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookPopup;
