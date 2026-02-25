import { createSlice } from "@reduxjs/toolkit";

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    quizzes: [],
    questions: []
  },
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
    },
    setQuestions: (state, action) => {
      state.questions = action.payload;
    }
  }
});

export const { setQuizzes, setQuestions } = quizSlice.actions;
export default quizSlice.reducer;