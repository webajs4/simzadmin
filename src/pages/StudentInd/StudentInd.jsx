import React from 'react';
import './studentind.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext/UserContext';
import { useEffect } from 'react';
import { useState } from 'react';
import { createClient } from "@supabase/supabase-js";
import { useStudent } from '../../context/StudentContext/StudentContext';

const supabase = createClient(import.meta.env.VITE_PROJECT_KEY, import.meta.env.VITE_ANON_KEY);


function StudentInd() {
    const { id } = useParams();
    const [studentInd,setStudentInd] = useState(null);
    const {user} = useUser();
    const {students,studentOnly} = useStudent();
    const navigate = useNavigate();
    useEffect(() => {
        
        if (!user) {
            navigate('/');
        }
    
        const fetchData = async () => {
            try {
                // Fetch single student details
                const { data: studentDetails, error: studentError } = await supabase
                    .from('student_details')
                    .select('*')
                    .eq('user_id', id)
                    .single();
    
                if (studentError) {
                    console.log('Error fetching student details:', studentError);
                    return;
                }
    
                // Fetch all users from auth
                const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
                if (usersError) {
                    console.log('Error fetching users:', usersError);
                    return;
                }
    
                // Combine the single student data with the corresponding auth user data
                const userDetails = authUsers.users.find(user => user.id === studentDetails.user_id);
    
                // Add user details to the student object
                const combinedData = { ...studentDetails, user: userDetails };
    
                // Ensure attendance_details is an array
                const attendance = Array.isArray(combinedData.attendance_details?.data)
    ? combinedData.attendance_details.data.map(record => ({
        attDate: new Date(parseInt(record.date) * 1000).toLocaleDateString(),
        attStatus: record.is_present ? "Present" : record.is_absent ? "Absent" : "Unknown",
    }))
    : []; // Default to an empty array if `attendance_details.data` is not an array

    // console.log("Combined Data:", combinedData);
    
                // Use prev_learn field for lessons
                const lessons = combinedData.prev_learn || [];
    
                // Set state
                setStudentInd(combinedData);
                studentOnly(attendance, lessons);
                // console.log("Setting Data",attendance,lessons);
            } catch (error) {
                console.error('Unexpected error:', error);
            }
        };
    
        fetchData();
    }, [id, user, studentOnly, navigate]);
    
    

  return (
    <div>
        {studentInd ? (
            <div key={studentInd.user_id}>
            <div className="stindhead">
    <h3>{studentInd.user?.user_metadata?.username || 'Unknown'}</h3>
    <p>{Array.isArray(studentInd.courses) 
              ? studentInd.courses.join(', ') 
              : 'No courses available'} Student</p>
    <Link to={`/attendance/${studentInd.user_id}`}>Attendance </Link>
    <Link to={`/lessons/${studentInd.user_id}`}>Lessons</Link>
    <p>Grade Covered : {studentInd.lessons}</p>
    <p>Fee due : Rs.{studentInd.fee_due}</p>
    </div>
    <div className="stindbadge">
        <h5>Badges Gained</h5>
        <ul>
            <li>Red Badge</li>
            <li>Green badge</li>
        </ul>
    </div>
    <div className="stindcertificate">
    <h5>Certificates Earned</h5>
        <ul>
            <li>Initial </li>
            <li>1</li>
        </ul>
    </div>
        </div>
        ) : (<div className="loader-container"><div className='loaderAllSTI'></div></div>)}
        {/* <div className="stindhead">
        <h3>Alan Jose Santo</h3>
        <p>Keyboard Student</p>
        <Link to='/attendance'>Attendance </Link>
        <Link to='/lessons'>Lessons</Link>
        <p>Grade Covered : GRADE 2</p>
        <p>Fee due : Rs.2000</p>
        </div>
        <div className="stindbadge">
            <h5>Badges Gained</h5>
            <ul>
                <li>Red Badge</li>
                <li>Green badge</li>
            </ul>
        </div>
        <div className="stindcertificate">
        <h5>Certificates Earned</h5>
            <ul>
                <li>Initial </li>
                <li>1</li>
            </ul>
        </div> */}

    </div>
  )
}

export default StudentInd