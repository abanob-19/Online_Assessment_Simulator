const mongoose = require('mongoose')

const Schema = mongoose.Schema
const mcqQuestionSchema = new Schema({
  
  text: {
    type: String,
    required: true,
  },
  choices: {
    type: [String],
    required: true,
  },
  
  answer: {
    type: String,
  },
  type:{
    type:String,
    default:"mcq",
    required:true,
  },
  category:{
    type:String,
    required:true,
  },
});
const textQuestionSchema = new Schema({
  
  text: {
    type: String,
    required: true,
  }, 
  type:{
    type:String,
    required:true,
  },
  category:{
    type:String,
    required:true,
  },
});
const examBankSchema = new Schema({
    title: {
      type: String,
      required: true,
      unique: true,
    },
    course: {
      type: String,
      required: true,
    },
    questions: {
      type: [mcqQuestionSchema| textQuestionSchema],
      default: [],
    },
  });
  examBank=mongoose.model('examBank', examBankSchema)
  mcqQuestion = mongoose.model('mcqQuestion', mcqQuestionSchema)
  textQuestion = mongoose.model('textQuestion', textQuestionSchema)
  module.exports ={examBank, mcqQuestion,textQuestion}