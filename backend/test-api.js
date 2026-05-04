async function testAPI() {
  try {
    console.log('Testing Register...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test' + Date.now() + '@test.com',
        password: 'password',
        age: '',
        height: '',
        weight: '',
        goal: 'Maintenance'
      })
    });
    const regData = await regRes.json();
    console.log('Register Response Status:', regRes.status);
    console.log('Register Response Data:', regData);
  } catch (err) {
    console.error('Register Error:', err.message);
  }

  try {
    console.log('\nTesting Login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status);
    console.log('Login Response Data:', loginData);
  } catch (err) {
    console.error('Login Error:', err.message);
  }
}

testAPI();
