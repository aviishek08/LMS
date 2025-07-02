import React from "react";

const BorrowDetailsPopup = ({ borrow, onClose }) => {
  if (!borrow) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-4 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Borrow Details</h2>
        <div className="mb-2"><span className="font-semibold">User:</span> {borrow.user?.name} ({borrow.user?.email})</div>
        <div className="mb-2"><span className="font-semibold">Book:</span> {borrow.book?.title || "N/A"}</div>
        <div className="mb-2"><span className="font-semibold">Borrowed Date:</span> {borrow.createdAt ? new Date(borrow.createdAt).toLocaleString() : "N/A"}</div>
        <div className="mb-2"><span className="font-semibold">Due Date:</span> {borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : "N/A"}</div>
        <div className="mb-2"><span className="font-semibold">Returned:</span> {borrow.returnDate ? "Yes" : "No"}</div>
        {borrow.returnDate && (
          <div className="mb-2"><span className="font-semibold">Return Date:</span> {new Date(borrow.returnDate).toLocaleString()}</div>
        )}
        <div className="mb-2"><span className="font-semibold">Price:</span> ${borrow.price}</div>
      </div>
    </div>
  );
};

export default BorrowDetailsPopup;
