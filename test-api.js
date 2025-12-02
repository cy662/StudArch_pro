import fetch from 'node-fetch';

async function testApi() {
  try {
    const response = await fetch('http://localhost:3001/api/training-program/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courses: [
          {
            course_number: 'CS101',
            course_name: '计算机基础',
            credits: 3,
            recommended_grade: '大一',
            semester: '第一学期',
            exam_method: '笔试',
            course_nature: '必修课'
          }
        ],
        programCode: 'CS_2021'
      }),
    });

    const result = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testApi();