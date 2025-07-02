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
import { updateBookDetails, rateBook } from '../store/slices/bookSlice';

const ReadBookPopup = ({ book }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Assuming auth state has user
  const isAdmin = user?.role === "Admin";

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...book });
  const [userRating, setUserRating] = useState(() => {
    if (!book || !user) return 0;
    const found = book.ratings?.find(r => r.user === user._id || r.user?._id === user._id);
    return found ? found.rating : 0;
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate average rating
  const avgRating = book.ratings && book.ratings.length > 0
    ? (book.ratings.reduce((sum, r) => sum + r.rating, 0) / book.ratings.length).toFixed(1)
    : null;

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

  const handleStarClick = async (rating) => {
    setSubmitting(true);
    setUserRating(rating);
    await dispatch(rateBook(book._id, rating));
    setSubmitting(false);
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
          {/* Average Rating */}
          <div className="mb-2">
            <label className="block text-gray-700 font-semibold">Average Rating</label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-yellow-500">
                {avgRating ? `${avgRating} / 5` : "No ratings yet"}
              </span>
              {avgRating && (
                <span className="flex text-yellow-400 text-lg">
                  {[1,2,3,4,5].map(star => (
                    <span key={star}>{avgRating >= star ? '★' : '☆'}</span>
                  ))}
                </span>
              )}
            </div>
          </div>
          {/* Star Rating UI (only for non-admins) */}
          {!isAdmin && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Your Rating</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`text-2xl ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => handleStarClick(star)}
                    disabled={submitting}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                {submitting && <span className="ml-2 text-xs text-gray-500">Saving...</span>}
              </div>
            </div>
          )}
          {editMode ? (
            <>
              {["title", "author", "description"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold capitalize">
                    {field}
                  </label>
                  <input
                    type={field === "price" || field === "quantity" ? "number" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  />
                </div>
              ))}
              {/* Genre field for edit mode, after description */}
              <div>
                <label className="block text-gray-700 font-semibold">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={Array.isArray(formData.genre) ? formData.genre.join(', ') : formData.genre || ''}
                  onChange={e => setFormData(prev => ({ ...prev, genre: e.target.value.split(',').map(g => g.trim()) }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
                <span className="text-xs text-gray-500">Comma separated</span>
              </div>
              {["price", "quantity"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold capitalize">
                    {field}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {["title", "author", "description"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold capitalize">
                    {field}
                  </label>
                  <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                    {book[field]}
                  </p>
                </div>
              ))}
              {/* Genre field for view mode, after description */}
              <div>
                <label className="block text-gray-700 font-semibold">Genre</label>
                <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                  {Array.isArray(book.genre) ? book.genre.join(', ') : book.genre}
                </p>
              </div>
              {["price", "quantity"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold capitalize">
                    {field}
                  </label>
                  <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                    {book[field]}
                  </p>
                </div>
              ))}
            </>
          )}
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

