import mongoose, { mongo } from "mongoose";

const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    author:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    availability:{
        type: Boolean,
        default: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    ratings: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            }
        }
    ]
},
{
    timestamps: true,
}
);

export const Book = mongoose.model("Book", bookSchema);