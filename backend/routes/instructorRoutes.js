const express = require('express')
const {
  seeMyCourses,
  getinstructor, 
  seeCourse,
  seeExams,
  createExam,
  editExam,
  deleteExam,
  addQuestionBank,
  openQuestionBank,
  deleteQuestionBank,
  editQuestionBank,
  addMcqQuestion,
  editMcqQuestion,
  deleteMcqQuestion,
  addStudents,
} = require('../controllers/instructorController')
const router = express.Router()
// GET a single instructor for login
router.post('/getInstructor', getinstructor)
router.get('/seeMyCourses/:id',seeMyCourses)
router.get('/seeCourse/:name',seeCourse)
router.get('/seeExams/:name',seeExams)
router.post('/createExam/',createExam)
router.put('/editExam/',editExam)
router.delete('/deleteExam/',deleteExam)
router.post('/addQuestionBank/',addQuestionBank)
router.get('/openQuestionBank/',openQuestionBank)
router.put('/editQuestionBank/',editQuestionBank)
router.delete('/deleteQuestionBank/',deleteQuestionBank)
router.post('/addMcqQuestion/',addMcqQuestion)
router.put('/editMcqQuestion/',editMcqQuestion)
router.delete('/deleteMcqQuestion/',deleteMcqQuestion)
router.post('/addStudents/',addStudents)
module.exports = router