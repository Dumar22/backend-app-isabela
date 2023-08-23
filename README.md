*****////////////////////////////////

Back-end made in Node.js for warehouse inventory application, using node.js, Sequielize, JWT, MySQL, jspdf. 
The application consists of the following modules: start of session and close of session, raw for users,  stores, suppliers, collaborators, also creates invoices in pdf.

APP-ISABELLA

application of warehouse inventories,
start of session and close of session, crud for users,  stores, suppliers, collaborators, also creates invoices in pdf.

Prerequisites
Before installing and running the application, make sure you have the following technologies installed on your system:

Node.js (version v18.15.0)
MySQL ( Server version: 8.0.33 MySQL Community Server)

Installing
To install the app, follow these steps:

Clone the GitHub repository on your local machine.

Access the project folder in the terminal.

Run the following command to install all dependencies:

npm install

Create a database in MySQL with the name you want.

Create a .env file in the project root and add the following environment variables:

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=user only
DB_PASSWORD=tu_contraseña_de_mysql
JWT_SECRET=tu_clave_secreta_para_generar_tokens_JWT
```

Tables and data types are created directly from the start of the application when the server rises.

Configuration
for more information on using jspdf visit its official website.

Use
To start the application, run the following command:

npm index.js

The application will run on http://localhost:process.env.PORT || 3000.

you can test the application and each endpoint with postman

Technologies used

1 Node.js.
2 Express
3 Sequelize.
4 JWT. 
4 MySQL.
5 bcrypt.
6 jspdf.
7 jspdf-autotable.


Contribution
If you want to contribute to the project contact me:

Mail: dumarfonseka@hotmail.com

Licence
does not require.

Author
Dumar Fonseca
Mail: dumarfonseka@hotmail.com.