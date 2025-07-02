import {createSlice} from "@reduxjs/toolkit"

const popupSlice = createSlice({
    name: "popup",
    initialState:{
        settingPopup: false,
        addBookPopup: false,
        readBookPopup: false,
        recordBookPopup: false,
        returnBookPopup: false,
        addNewAdminPopup: false,
        deleteBookPopup: false,
        deleteBookId: "",
    },
    reducers:{
        toggleSettingPopup(state){
            state.settingPopup = !state.settingPopup;
        },
        toggleAddBookPopup(state){
            state.addBookPopup = !state.addBookPopup;
        },
        toggleReadBookPopup(state){
            state.readBookPopup = !state.readBookPopup;
        },
        toggleReturnBookPopup(state){
            state.returnBookPopup = !state.returnBookPopup;
        },
        toggleRecordBookPopup(state){
            state.recordBookPopup = !state.recordBookPopup;
        },
        toggleAddNewAdminPopup(state){
            state.addNewAdminPopup = !state.addNewAdminPopup;
        },
        toggleDeleteBookPopup(state, action) {
      state.deleteBookPopup = !state.deleteBookPopup;
      state.deleteBookId = action?.payload || "";
    },
        closeAllPopup(state){
            state.addBookPopup = false;
            state.addNewAdminPopup = false;
            state.readBookPopup = false;
            state.recordBookPopup = false;
            state.returnBookPopup = false;
            state.settingPopup = false;

            state.deleteBookPopup = false;
      state.deleteBookId = "";
        },
    },
});



export const {
    closeAllPopup,
    toggleAddBookPopup,
    toggleAddNewAdminPopup,
    toggleReadBookPopup,
    toggleRecordBookPopup,
    toggleReturnBookPopup,
    toggleSettingPopup,
    toggleDeleteBookPopup,
} = popupSlice.actions;
export default popupSlice.reducer;
