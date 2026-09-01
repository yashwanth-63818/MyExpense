const fs = require('fs');
const path = require('path');

const pages = [
  'Dashboard', 'SignIn', 'SignUp', 'AmountReceived', 'Expenses', 
  'Savings', 'Transactions', 'Analytics', 'Budget', 'Reminders', 'Settings'
];

const dir = path.join(process.cwd(), 'src', 'pages');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

pages.forEach(page => {
  const content = `import React from 'react';

const ${page} = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-medium text-gray-900">${page}</h1>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(dir, `${page}.jsx`), content);
});

console.log('Pages created successfully.');
