import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentExamCard from '../components/StudentExamCard';
import { useParams } from "react-router-dom";
 import StudentNavbar from '../components/StudentNavbar';
 import { useInstructorsContext } from '../hooks/useInstrcutorContext'
 import styles from './Instructor.module.css';
 import { useNavigate } from "react-router-dom";
 import { useInRouterContext, Navigate } from 'react-router-dom'

function StudentGrades() {
 // const { navigate } = useInRouterContext();
  const navigate = useNavigate();
  const [exams, setExams] = useState(null);
  const { courseName } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { state,dispatch } = useInstructorsContext()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
 
  


  useEffect( () => {
    if (!user)
    { 
      navigate('/'); return  ; 
    }
    else if (user.role != "student")
     { navigate('/InstructorCourses'); return  ;}
     document.title = "Online Assessment Simulator";
    setIsLoading(true);
    axios.get(`/student/seeExamsForGrades/?courseName=${courseName}&studentId=${user._id}`)
      .then(response => {
        setExams(response.data);
        console.log("executed get")
       // console.log(state.secVersion)

      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
if(!exams|| isLoading){
  return  <div className={styles['container']}>
  <div className={styles['loader']}></div>
</div>
}

return (
  <div>
  <StudentNavbar/>
  <div style={{ paddingTop: '72px' , textAlign: "center"}} >
    <h1 style={{color:'white'}}>My Grades</h1>
    <table style={{ borderCollapse: 'collapse', width: '40%' , backgroundColor: 'white' , margin:"auto" }}>
      <thead>
        <tr>
        <th style={{ border: '1px solid black', padding: '10px', borderRadius: '50px' }}>Exam Title</th>
          <th style={{ border: '1px solid black', padding: '10px' ,borderRadius: '50px' }}>Your Grade</th>
          <th style={{ border: '1px solid black', padding: '10px' ,borderRadius: '50px' }}>Total Grade</th>
        </tr>
      </thead>
      <tbody>
        {exams.map(exam => (
          <tr key={exam._id}>
            <td style={{ border: '1px solid black', padding: '10px' }}>{exam.title}</td>
            <td style={{ border: '1px solid black', padding: '10px'  }}>{exam.graded ? exam.totalGrade : '-'}</td>
            <td style={{ border: '1px solid black', padding: '10px'  }}>{exam.totalPossibleGrade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

);
}


export default StudentGrades;
