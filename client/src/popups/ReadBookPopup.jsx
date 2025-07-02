// import React from 'react'
// import { useDispatch } from 'react-redux'
// import { toggleReadBookPopup } from '../store/slices/popUpSlice';

// const ReadBookPopup = ({book}) => {
//   const dispatch = useDispatch();
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50">
//       <div className="w-11/12 bg-white rounded-lg shadow-lg sm:w-1/2 lg:w-1/3 2xl:w-1/3">
//       <div className="flex justify-between items-center bg-black text-white px-6 py-4 rounded-t-lg">
//         <h2 className="text-lg font-bold">View Book Info</h2>
//           <button className="text-white text-lg font-bold" onClick={()=>dispatch(toggleReadBookPopup())}>&times;</button>
//       </div>

//       <div className='p-6'>
//         <div className='mb-4'>
//           <label className='block text-gray-700 font-semibold'>Book Title</label>
//           <p className='border border-gray-300 rounded-lg px-4 py-2 bg-gray-100'>{book && book.title}</p>
//         </div>
//         <div className='mb-4'>
//           <label className='block text-gray-700 font-semibold'>Author</label>
//           <p className='border border-gray-300 rounded-lg px-4 py-2 bg-gray-100'>{book && book.author}</p>
//         </div>
//         <div className='mb-4'>
//           <label className='block text-gray-700 font-semibold'>Description</label>
//           <p className='border border-gray-300 rounded-lg px-4 py-2 bg-gray-100'>{book && book.description}</p>
//         </div>
//       </div>
//       <div className='flex justify-end px-6 py-4 bg-gray-100 rounded-b-lg'>
//         <button className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300' type='button' 
//         onClick={()=> dispatch(toggleReadBookPopup())}>Close</button>
//       </div>

//       </div>
      
//     </div>
//   )
// }

// export default ReadBookPopup

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleReadBookPopup } from '../store/slices/popUpSlice';
import { updateBookDetails } from '../store/slices/bookSlice';

const ReadBookPopup = ({ book }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Assuming auth state has user
  const isAdmin = user?.role === "Admin";

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...book });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    dispatch(updateBookDetails(book._id, formData));
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({ ...book }); // Revert changes
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50">
      <div className="w-11/12 bg-white rounded-lg shadow-lg sm:w-1/2 lg:w-1/3 2xl:w-1/3">
        {/* Header */}
        <div className="flex justify-between items-center bg-black text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-bold">{editMode ? "Edit Book Info" : "View Book Info"}</h2>
          <button
            className="text-white text-lg font-bold"
            onClick={() => dispatch(toggleReadBookPopup())}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {["title", "author", "description", "price", "quantity"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-semibold capitalize">
                {field}
              </label>
              {editMode ? (
                <input
                  type={field === "price" || field === "quantity" ? "number" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
              ) : (
                <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                  {book[field]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-100 rounded-b-lg">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={() => dispatch(toggleReadBookPopup())}
          >
            Close
          </button>

          {isAdmin && (
            <div className="space-x-2">
              {editMode ? (
                <>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadBookPopup;

