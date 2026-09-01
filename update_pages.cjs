const fs = require('fs');
const path = require('path');

const pages = [
  'Dashboard', 'AmountReceived', 'Expenses', 
  'Savings', 'Transactions', 'Analytics', 'Budget', 'Reminders', 'Settings'
];

const dir = path.join(process.cwd(), 'src', 'pages');

pages.forEach(page => {
  const content = `import React from 'react';

const ${page} = () => {
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">${page.replace(/([A-Z])/g, ' $1').trim()}</h1>
      <p className="text-gray-500 mt-2 font-medium">This is the placeholder for the ${page.replace(/([A-Z])/g, ' $1').trim()} page.</p>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(dir, `${page}.jsx`), content);
});

console.log('Main pages updated.');
